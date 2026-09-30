import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { ProductsService } from "../products/products.service";
import { LogsService } from "../logs/logs.service";
import { roundMoney } from "../common/utils/money.util";
import { CreateSaleDto } from "./dto/sale.dto";

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<Sale>,
    private readonly productsService: ProductsService,
    private readonly logsService: LogsService
  ) {}

  async findAll(): Promise<Sale[]> {
    return this.saleModel
      .find()
      .populate("customerId")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCustomer(customerId: string): Promise<Sale[]> {
    return this.saleModel
      .find({ customerId })
      .populate("customerId")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    const decrementedItems: { productId: string; quantity: number }[] = [];

    if (createSaleDto.items && Array.isArray(createSaleDto.items)) {
      for (const item of createSaleDto.items) {
        if (item.costAtPurchase === undefined || item.costAtPurchase === null) {
          item.costAtPurchase = 0;
        }
        item.priceAtPurchase = roundMoney(item.priceAtPurchase);
        item.costAtPurchase = roundMoney(item.costAtPurchase || 0);

        // Baixa no estoque
        try {
          await this.productsService.incrementStock(item.productId, -item.quantity);
          decrementedItems.push({ productId: item.productId, quantity: item.quantity });
        } catch (err) {
          console.error(`Falha ao decrementar estoque de ${item.productId}:`, err);
        }
      }
    }

    createSaleDto.totalPrice = roundMoney(createSaleDto.totalPrice);
    const createdSale = new this.saleModel(createSaleDto);

    try {
      return await createdSale.save();
    } catch (saveError) {
      console.error("Falha ao salvar a venda, iniciando rollback de estoque:", saveError);
      // Rollback manual (compensação) se o banco não for replica set
      for (const item of decrementedItems) {
        try {
          await this.productsService.incrementStock(item.productId, item.quantity);
        } catch (rollbackErr) {
          console.error(`Falha no rollback de estoque para ${item.productId}:`, rollbackErr);
        }
      }
      throw new BadRequestException("Falha ao processar a venda. O estoque foi restaurado.");
    }
  }

  async updateStatus(id: string, status: string): Promise<Sale> {
    if (status === "CANCELADO") {
      throw new BadRequestException("Use o endpoint de cancelamento explícito (/sales/:id/cancel) para cancelar vendas e estornar estoque.");
    }

    const updated = await this.saleModel
      .findByIdAndUpdate(id, { status }, { new: true, returnDocument: 'after' as any })
      .populate("customerId")
      .populate("items.productId")
      .exec();

    if (!updated) {
      throw new NotFoundException(`Sale with ID ${id} not found`);
    }

    const customerName = (updated.customerId as any)?.firstName || "Cliente";
    const operatorName = "Admin";
    try {
      await this.logsService.create({
        userId: "system",
        userName: operatorName,
        action: "sale_update_status",
        description: `${operatorName} alterou o status da venda #${id} para ${status} (Cliente: ${customerName}, Valor: R$ ${updated.totalPrice.toFixed(2)})`,
        metadata: {
          saleId: id,
          status,
          totalPrice: updated.totalPrice,
          eventId: updated.eventId,
        },
      });
    } catch (err) {
      console.error("Falha ao registrar log de mudança de status:", err);
    }

    return updated;
  }

  async cancelSale(id: string, operatorId: string): Promise<Sale> {
    const sale = await this.saleModel
      .findById(id)
      .populate("customerId")
      .populate("items.productId")
      .exec();

    if (!sale) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }

    if (sale.status === "CANCELADO") {
      throw new BadRequestException("Esta venda já foi cancelada anteriormente");
    }

    // 1. Devolver itens ao estoque de forma atômica ($inc positivo)
    for (const item of sale.items) {
      const productIdStr = (item.productId as any)._id 
        ? (item.productId as any)._id.toString() 
        : item.productId.toString();
      try {
        console.log(`[SalesService] Incrementing stock atomically for product ${productIdStr} by +${item.quantity}`);
        await this.productsService.incrementStock(productIdStr, item.quantity);
      } catch (err) {
        console.error(`Falha ao estornar estoque atomicamente do produto ${productIdStr}:`, err);
      }
    }

    // 2. Mudar status da venda para CANCELADO
    sale.status = "CANCELADO";
    const savedSale = await sale.save();

    // 3. Registrar o Log de Auditoria do estorno
    const customerName = (sale.customerId as any)?.firstName || "Cliente";
    const operatorName = "Admin";
    const itemsDescription = sale.items
      .map((i: any) => `${i.quantity}x ${i.productId?.name || "Produto"}`)
      .join(", ");

    try {
      await this.logsService.create({
        userId: operatorId || "system",
        userName: operatorName,
        action: "sale_cancel",
        description: `${operatorName} cancelou a venda #${id} realizada para o cliente ${customerName} no valor de R$ ${sale.totalPrice.toFixed(2)}, devolvendo os itens [ ${itemsDescription} ] ao estoque`,
        metadata: {
          saleId: id,
          totalPrice: sale.totalPrice,
          items: sale.items,
          eventId: sale.eventId,
        },
      });
    } catch (err) {
      console.error("Falha ao registrar log de cancelamento:", err);
    }

    return savedSale;
  }
}
