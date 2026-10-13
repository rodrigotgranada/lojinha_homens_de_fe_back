import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { StockEntry } from "../schemas/stock-entry.schema";
import { Product } from "../schemas/product.schema";
import { EventStock } from "../schemas/event-stock.schema";
import { WebsocketGateway } from "../websocket/websocket.gateway";
import { LogsService } from "../logs/logs.service";
import { ExpensesService } from "../expenses/expenses.service";
import { roundMoney } from "../common/utils/money.util";
import { CreateStockEntryDto } from "./dto/stock-entry.dto";

@Injectable()
export class StockEntriesService {
  private readonly logger = new Logger(StockEntriesService.name);

  constructor(
    @InjectModel(StockEntry.name)
    private readonly stockEntryModel: Model<StockEntry>,
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(EventStock.name)
    private readonly eventStockModel: Model<EventStock>,
    private readonly wsGateway: WebsocketGateway,
    private readonly logsService: LogsService,
    private readonly expensesService: ExpensesService
  ) {}

  async create(dto: CreateStockEntryDto): Promise<StockEntry> {
    if (!Types.ObjectId.isValid(dto.productId)) {
      throw new BadRequestException("ID de produto inválido");
    }

    const product = await this.productModel.findById(dto.productId).exec();
    if (!product) {
      throw new NotFoundException(`Produto com ID ${dto.productId} não encontrado`);
    }

    const quantity = Math.max(1, Math.floor(Number(dto.quantity) || 1));
    const costPrice = roundMoney(Number(dto.costPrice) || 0);
    const totalCost =
      dto.totalCost !== undefined
        ? roundMoney(Number(dto.totalCost))
        : roundMoney(quantity * costPrice);

    const isDonation = !!dto.isDonation;
    const eventId =
      dto.eventId && Types.ObjectId.isValid(dto.eventId)
        ? dto.eventId
        : product.eventId
        ? product.eventId.toString()
        : undefined;

    const operatorName = dto.operatorName || "Admin";

    // 1. Integrar automaticamente com a Gestão de Despesas do Retiro se houver evento
    let expenseGroupId: Types.ObjectId | undefined;
    let expenseItemId: Types.ObjectId | undefined;

    if (eventId && Types.ObjectId.isValid(eventId) && (totalCost > 0 || isDonation)) {
      try {
        const expenses = await this.expensesService.findAll(eventId);
        let group = expenses.find((e) => e.category === "LOJINHA");
        if (!group) {
          group = await this.expensesService.create({
            eventId,
            title: "Custos da Lojinha - Automático",
            category: "LOJINHA",
            nature: isDonation ? "LOJINHA_DOACAO" : "LOJINHA_INVESTIMENTO",
            description: "Grupo criado automaticamente pelo cadastro de entradas de estoque da lojinha.",
            operatorName,
          });
        }

        if (group) {
          const addedGroup = await this.expensesService.addItem(group._id.toString(), {
            description: `Lote de ${product.name} (${quantity} un.)`,
            amount: isDonation ? 0 : totalCost,
            paidBy: (dto.sponsorName || dto.sponsorCpf || "Desconhecido").trim(),
            payerPhone: dto.sponsorPhone || "",
            isDonation,
            operatorName,
            notes: dto.notes
              ? `Entrada de estoque: ${dto.notes}`
              : `Lote de ${quantity} un. do produto "${product.name}"`,
          });

          expenseGroupId = group._id as any;
          if (addedGroup && addedGroup.items && addedGroup.items.length > 0) {
            const lastItem = addedGroup.items[addedGroup.items.length - 1];
            expenseItemId = lastItem._id as any;
          }
        }
      } catch (err) {
        this.logger.error("Falha ao registrar despesa automática para entrada de estoque:", err);
      }
    }

    // 2. Criar registro de Entrada de Estoque (StockEntry)
    const stockEntry = new this.stockEntryModel({
      productId: product._id,
      eventId: eventId && Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : undefined,
      quantity,
      costPrice,
      totalCost,
      sponsorName: (dto.sponsorName || "").trim(),
      sponsorCpf: (dto.sponsorCpf || "").trim(),
      sponsorPhone: (dto.sponsorPhone || "").trim(),
      sponsorUserId:
        dto.sponsorUserId && Types.ObjectId.isValid(dto.sponsorUserId)
          ? new Types.ObjectId(dto.sponsorUserId)
          : undefined,
      isDonation,
      date: dto.date ? new Date(dto.date) : new Date(),
      notes: (dto.notes || "").trim(),
      operatorName,
      createdBy:
        dto.createdBy && Types.ObjectId.isValid(dto.createdBy)
          ? new Types.ObjectId(dto.createdBy)
          : undefined,
      expenseGroupId,
      expenseItemId,
    });

    const savedEntry = await stockEntry.save();

    // 3. Atualizar estoque do evento (EventStock) se houver evento
    if (eventId && Types.ObjectId.isValid(eventId)) {
      const eventObjId = new Types.ObjectId(eventId);
      await this.eventStockModel.updateOne(
        { eventId: eventObjId, productId: product._id },
        {
          $inc: {
            stock: quantity,
            initialStock: quantity,
            totalCost: isDonation ? 0 : totalCost,
          },
          $setOnInsert: {
            minStock: product.minStock || 5,
            price: product.price,
            sponsorName: dto.sponsorName || "",
            sponsorCpf: dto.sponsorCpf || "",
            isDonation: isDonation,
            createdAt: new Date(),
          },
          $set: {
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      ).exec();
    }

    // Atualizar estoque mestre do produto de forma incremental
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        product._id,
        {
          $inc: {
            stock: quantity,
            initialStock: quantity,
            totalCost: isDonation ? 0 : totalCost,
          },
        },
        { new: true }
      )
      .populate("categoryRef")
      .exec();

    // 4. Emitir evento Websocket para sincronização do PDV e Estoque
    if (updatedProduct) {
      this.wsGateway.broadcastStockChange(product.id, updatedProduct.stock);
      this.wsGateway.broadcastProductChange(updatedProduct);
    }

    // 5. Registrar log de auditoria
    await this.logsService.create({
      userId: dto.createdBy || "system",
      userName: operatorName,
      action: "product_stock_entry",
      description: `${operatorName} registrou entrada de ${quantity} un. no produto "${product.name}" (Patrocinador: ${dto.sponsorName || "Não informado"}, Custo: R$ ${totalCost.toFixed(2)}, Doação: ${isDonation ? "Sim" : "Não"})`,
      metadata: {
        productId: product.id,
        stockEntryId: savedEntry.id,
        quantity,
        costPrice,
        totalCost,
        isDonation,
        sponsorName: dto.sponsorName,
      },
    });

    return savedEntry;
  }

  async findByProduct(productId: string): Promise<StockEntry[]> {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException("ID de produto inválido");
    }

    return this.stockEntryModel
      .find({ productId: new Types.ObjectId(productId) })
      .sort({ date: -1, createdAt: -1 })
      .populate("sponsorUserId", "firstName lastName cpf phone")
      .exec();
  }

  async findByEvent(eventId: string): Promise<StockEntry[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new BadRequestException("ID de evento inválido");
    }

    return this.stockEntryModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ date: -1, createdAt: -1 })
      .populate("productId")
      .populate("sponsorUserId", "firstName lastName cpf phone")
      .exec();
  }

  async findAll(productId?: string, eventId?: string): Promise<StockEntry[]> {
    const filter: any = {};
    if (productId && Types.ObjectId.isValid(productId)) {
      filter.productId = new Types.ObjectId(productId);
    }
    if (eventId && Types.ObjectId.isValid(eventId)) {
      filter.eventId = new Types.ObjectId(eventId);
    }

    return this.stockEntryModel
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .populate("productId")
      .populate("sponsorUserId", "firstName lastName cpf phone")
      .exec();
  }

  async findOne(id: string): Promise<StockEntry> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID de entrada inválido");
    }

    const entry = await this.stockEntryModel
      .findById(id)
      .populate("productId")
      .populate("sponsorUserId", "firstName lastName cpf phone")
      .exec();

    if (!entry) {
      throw new NotFoundException(`Entrada de estoque #${id} não encontrada`);
    }

    return entry;
  }

  async delete(id: string, operatorName = "Admin"): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID de entrada inválido");
    }

    const entry = await this.stockEntryModel.findById(id).exec();
    if (!entry) {
      throw new NotFoundException(`Entrada de estoque #${id} não encontrada`);
    }

    if (entry.eventId) {
      await this.eventStockModel.updateOne(
        { eventId: entry.eventId, productId: entry.productId },
        {
          $inc: {
            stock: -entry.quantity,
            initialStock: -entry.quantity,
            totalCost: -(entry.isDonation ? 0 : entry.totalCost),
          },
        }
      ).exec();
    }

    const product = await this.productModel.findById(entry.productId).exec();
    if (product) {
      const newStock = Math.max(0, product.stock - entry.quantity);
      const newInitialStock = Math.max(0, (product.initialStock || 0) - entry.quantity);
      const newTotalCost = Math.max(0, (product.totalCost || 0) - (entry.isDonation ? 0 : entry.totalCost));

      product.stock = newStock;
      product.initialStock = newInitialStock;
      product.totalCost = newTotalCost;
      await product.save();

      const populatedProduct = await this.productModel
        .findById(product._id)
        .populate("categoryRef")
        .exec();

      if (populatedProduct) {
        this.wsGateway.broadcastStockChange(product.id, populatedProduct.stock);
        this.wsGateway.broadcastProductChange(populatedProduct);
      }
    }

    // Reverter item de despesa se existir vínculo
    if (entry.expenseGroupId && entry.expenseItemId) {
      try {
        await this.expensesService.deleteItem(
          entry.expenseGroupId.toString(),
          entry.expenseItemId.toString(),
          operatorName
        );
      } catch (err) {
        this.logger.warn(`Não foi possível remover o item de despesa vinculado à entrada de estoque #${id}:`, err);
      }
    }

    // Auditoria
    await this.logsService.create({
      userId: "system",
      userName: operatorName,
      action: "product_stock_entry_delete",
      description: `${operatorName} removeu a entrada de estoque de ${entry.quantity} un. do produto "${product ? product.name : entry.productId}"`,
      metadata: {
        stockEntryId: id,
        productId: entry.productId,
        quantity: entry.quantity,
        totalCost: entry.totalCost,
      },
    });

    await this.stockEntryModel.findByIdAndDelete(id).exec();

    return {
      success: true,
      message: `Entrada de estoque #${id} removida com sucesso.`,
    };
  }
}
