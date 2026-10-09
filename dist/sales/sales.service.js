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
const money_util_1 = require("../common/utils/money.util");
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
        const decrementedItems = [];
        if (createSaleDto.items && Array.isArray(createSaleDto.items)) {
            for (const item of createSaleDto.items) {
                if (item.costAtPurchase === undefined || item.costAtPurchase === null) {
                    item.costAtPurchase = 0;
                }
                item.priceAtPurchase = (0, money_util_1.roundMoney)(item.priceAtPurchase);
                item.costAtPurchase = (0, money_util_1.roundMoney)(item.costAtPurchase || 0);
                try {
                    await this.productsService.incrementStock(item.productId, -item.quantity);
                    decrementedItems.push({ productId: item.productId, quantity: item.quantity });
                }
                catch (err) {
                    console.error(`Falha ao decrementar estoque de ${item.productId}:`, err);
                }
            }
        }
        createSaleDto.totalPrice = (0, money_util_1.roundMoney)(createSaleDto.totalPrice);
        const createdSale = new this.saleModel(createSaleDto);
        try {
            return await createdSale.save();
        }
        catch (saveError) {
            console.error("Falha ao salvar a venda, iniciando rollback de estoque:", saveError);
            for (const item of decrementedItems) {
                try {
                    await this.productsService.incrementStock(item.productId, item.quantity);
                }
                catch (rollbackErr) {
                    console.error(`Falha no rollback de estoque para ${item.productId}:`, rollbackErr);
                }
            }
            throw new common_1.BadRequestException("Falha ao processar a venda. O estoque foi restaurado.");
        }
    }
    async updateStatus(id, status) {
        if (status === "CANCELADO") {
            throw new common_1.BadRequestException("Use o endpoint de cancelamento explícito (/sales/:id/cancel) para cancelar vendas e estornar estoque.");
        }
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
                    eventId: updated.eventId,
                },
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
                console.log(`[SalesService] Incrementing stock atomically for product ${productIdStr} by +${item.quantity}`);
                await this.productsService.incrementStock(productIdStr, item.quantity);
            }
            catch (err) {
                console.error(`Falha ao estornar estoque atomicamente do produto ${productIdStr}:`, err);
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
                    eventId: sale.eventId,
                },
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