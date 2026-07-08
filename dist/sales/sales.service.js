"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sale_schema_1 = require("../schemas/sale.schema");
const products_service_1 = require("../products/products.service");
const logs_service_1 = require("../logs/logs.service");
let SalesService = class SalesService {
    saleModel;
    productsService;
    logsService;
    constructor(saleModel, productsService, logsService) {
        this.saleModel = saleModel;
        this.productsService = productsService;
        this.logsService = logsService;
    }
    async findAll() {
        return this.saleModel
            .find()
            .populate("customerId")
            .populate("items.productId")
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByCustomer(customerId) {
        return this.saleModel
            .find({ customerId })
            .populate("customerId")
            .populate("items.productId")
            .sort({ createdAt: -1 })
            .exec();
    }
    async create(createSaleDto) {
        const createdSale = new this.saleModel(createSaleDto);
        return createdSale.save();
    }
    async updateStatus(id, status) {
        const updated = await this.saleModel
            .findByIdAndUpdate(id, { status }, { new: true, returnDocument: 'after' })
            .populate("customerId")
            .populate("items.productId")
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Sale with ID ${id} not found`);
        }
        const customerName = updated.customerId?.firstName || "Cliente";
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
        }
        catch (err) {
            console.error("Falha ao registrar log de mudança de status:", err);
        }
        return updated;
    }
    async cancelSale(id, operatorId) {
        const sale = await this.saleModel
            .findById(id)
            .populate("customerId")
            .populate("items.productId")
            .exec();
        if (!sale) {
            throw new common_1.NotFoundException(`Venda com ID ${id} não encontrada`);
        }
        if (sale.status === "CANCELADO") {
            throw new common_1.BadRequestException("Esta venda já foi cancelada anteriormente");
        }
        for (const item of sale.items) {
            const productIdStr = item.productId._id
                ? item.productId._id.toString()
                : item.productId.toString();
            try {
                const product = await this.productsService.findOne(productIdStr);
                if (product) {
                    const newStock = product.stock + item.quantity;
                    console.log(`[SalesService] Restoring stock of product ${product.name} (${productIdStr}): ${product.stock} -> ${newStock}`);
                    await this.productsService.updateStock(productIdStr, newStock);
                }
                else {
                    console.warn(`[SalesService] Product not found for stock restore: ${productIdStr}`);
                }
            }
            catch (err) {
                console.error(`Falha ao devolver estoque do produto ${productIdStr}:`, err);
            }
        }
        sale.status = "CANCELADO";
        const savedSale = await sale.save();
        const customerName = sale.customerId?.firstName || "Cliente";
        const operatorName = "Admin";
        const itemsDescription = sale.items
            .map((i) => `${i.quantity}x ${i.productId?.name || "Produto"}`)
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
        }
        catch (err) {
            console.error("Falha ao registrar log de cancelamento:", err);
        }
        return savedSale;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        products_service_1.ProductsService,
        logs_service_1.LogsService])
], SalesService);
//# sourceMappingURL=sales.service.js.map