import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
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

  async findAll(eventId?: string): Promise<Sale[]> {
    try {
      const filter: any = {};
      if (eventId && Types.ObjectId.isValid(eventId)) {
        filter.$or = [
          { eventId: new Types.ObjectId(eventId) },
          { eventId: eventId },
        ];
      }
      return await this.saleModel
        .find(filter)
        .populate("customerId")
        .populate("items.productId")
        .sort({ createdAt: -1 })
        .exec();
    } catch (err) {
      console.error("Error in findAll:", err);
      throw err;
    }
  }

  async findByCustomer(customerId: string): Promise<Sale[]> {
    const objectId = Types.ObjectId.isValid(customerId) ? new Types.ObjectId(customerId) : null;
    const filter = objectId ? { $or: [{ customerId: objectId }, { customerId }] } : { customerId };

    return this.saleModel
      .find(filter)
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

    if (status === "PAGO" && updated.customerId) {
      try {
        const cId = ((updated.customerId as any)._id || updated.customerId).toString();
        const objectId = Types.ObjectId.isValid(cId) ? new Types.ObjectId(cId) : null;
        const filter = objectId
          ? { $or: [{ customerId: objectId }, { customerId: cId }], status: "PENDENTE" }
          : { customerId: cId, status: "PENDENTE" };
        const remaining = await this.saleModel.countDocuments(filter);
        if (remaining === 0) {
          await this.saleModel.db.model("User").findByIdAndUpdate(cId, {
            $set: { lastChargedAt: null, chargeCount: 0 }
          }).exec();
        }
      } catch (e) {
        // ignore
      }
    }

    return updated;
  }

  async payAllCustomerSales(customerId: string): Promise<{ updatedCount: number; totalPaid: number }> {
    const objectId = Types.ObjectId.isValid(customerId) ? new Types.ObjectId(customerId) : null;
    const filter = objectId
      ? { $or: [{ customerId: objectId }, { customerId }], status: "PENDENTE" }
      : { customerId, status: "PENDENTE" };

    const pendingSales = await this.saleModel
      .find(filter)
      .populate("customerId")
      .exec();

    if (!pendingSales || pendingSales.length === 0) {
      return { updatedCount: 0, totalPaid: 0 };
    }

    const totalPaid = roundMoney(
      pendingSales.reduce((acc, s) => acc + (s.totalPrice || 0), 0)
    );
    const saleIds = pendingSales.map((s) => s._id);

    await this.saleModel
      .updateMany(
        { _id: { $in: saleIds } },
        { $set: { status: "PAGO" } }
      )
      .exec();

    // Reset da flag de cobrança do cliente pois as pendências foram 100% quitadas
    try {
      await this.saleModel.db.model("User").findByIdAndUpdate(customerId, {
        $set: { lastChargedAt: null, chargeCount: 0 }
      }).exec();
    } catch (e) {
      // ignore
    }

    const customerObj = pendingSales[0].customerId as any;
    const customerName = customerObj?.firstName
      ? `${customerObj.firstName} ${customerObj.lastName || ""}`.trim()
      : "Cliente";

    try {
      await this.logsService.create({
        userId: "system",
        userName: "Admin",
        action: "sale_bulk_pay",
        description: `Quitação em massa de pendências: ${pendingSales.length} venda(s) do cliente ${customerName} foram marcadas como PAGAS (Total quitado: R$ ${totalPaid.toFixed(2)}).`,
        metadata: {
          customerId,
          saleIds,
          totalPaid,
          count: pendingSales.length,
        },
      });
    } catch (err) {
      console.error("Falha ao registrar log de quitação em massa:", err);
    }

    return { updatedCount: pendingSales.length, totalPaid };
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
