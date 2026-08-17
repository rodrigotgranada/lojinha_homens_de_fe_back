import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { ProductsService } from "../products/products.service";
import { LogsService } from "../logs/logs.service";

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

  async create(createSaleDto: any): Promise<Sale> {
    if (createSaleDto.items && Array.isArray(createSaleDto.items)) {
      for (const item of createSaleDto.items) {
        if (item.costAtPurchase === undefined || item.costAtPurchase === null) {
          try {
            const prod = await this.productsService.findOne(item.productId);
            item.costAtPurchase = prod?.costPrice || 0;
          } catch (e) {
            item.costAtPurchase = 0;
          }
        }
      }
    }
    const createdSale = new this.saleModel(createSaleDto);
    return createdSale.save();
  }

  async updateStatus(id: string, status: string): Promise<Sale> {
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
          eventId: updated.eventId
        }
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

    // 1. Devolver itens de volta ao estoque
    for (const item of sale.items) {
      const productIdStr = (item.productId as any)._id 
        ? (item.productId as any)._id.toString() 
        : item.productId.toString();
      try {
        const product = await this.productsService.findOne(productIdStr);
        if (product) {
          const newStock = product.stock + item.quantity;
          console.log(`[SalesService] Restoring stock of product ${product.name} (${productIdStr}): ${product.stock} -> ${newStock}`);
          await this.productsService.updateStock(productIdStr, newStock);
        } else {
          console.warn(`[SalesService] Product not found for stock restore: ${productIdStr}`);
        }
      } catch (err) {
        console.error(`Falha ao devolver estoque do produto ${productIdStr}:`, err);
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
          eventId: sale.eventId
        }
      });
    } catch (err) {
      console.error("Falha ao registrar log de cancelamento:", err);
    }

    return savedSale;
  }
}
