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
    async findAll(eventId) {
        try {
            const filter = {};
            if (eventId && mongoose_2.Types.ObjectId.isValid(eventId)) {
                filter.$or = [
                    { eventId: new mongoose_2.Types.ObjectId(eventId) },
                    { eventId: eventId },
                ];
            }
            return await this.saleModel
                .find(filter)
                .populate("customerId")
                .populate("items.productId")
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (err) {
            console.error("Error in findAll:", err);
            throw err;
        }
    }
    async findByCustomer(customerId) {
        const objectId = mongoose_2.Types.ObjectId.isValid(customerId) ? new mongoose_2.Types.ObjectId(customerId) : null;
        const filter = objectId ? { $or: [{ customerId: objectId }, { customerId }] } : { customerId };
        return this.saleModel
            .find(filter)
            .populate("customerId")
            .populate("items.productId")
            .sort({ createdAt: -1 })
            .exec();
    }
    async create(createSaleDto) {
        const decrementedItems = [];
        if (createSaleDto.items && Array.isArray(createSaleDto.items)) {
            for (const item of createSaleDto.items) {
                if (!item.costAtPurchase || item.costAtPurchase === 0) {
                    try {
                        const prod = await this.productsService.findOne(item.productId);
                        if (prod && prod.totalCost && prod.totalCost > 0) {
                            const divisor = prod.initialStock || prod.stock || 1;
                            item.costAtPurchase = (0, money_util_1.roundMoney)(prod.totalCost / divisor);
                        }
                        else {
                            item.costAtPurchase = 0;
                        }
                    }
                    catch {
                        item.costAtPurchase = 0;
                    }
                }
                item.priceAtPurchase = (0, money_util_1.roundMoney)(item.priceAtPurchase);
                item.costAtPurchase = (0, money_util_1.roundMoney)(item.costAtPurchase || 0);
                try {
                    await this.productsService.incrementStock(item.productId, -item.quantity, createSaleDto.eventId);
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
                    await this.productsService.incrementStock(item.productId, item.quantity, createSaleDto.eventId);
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
        if (status === "PAGO" && updated.customerId) {
            try {
                const cId = (updated.customerId._id || updated.customerId).toString();
                const objectId = mongoose_2.Types.ObjectId.isValid(cId) ? new mongoose_2.Types.ObjectId(cId) : null;
                const filter = objectId
                    ? { $or: [{ customerId: objectId }, { customerId: cId }], status: "PENDENTE" }
                    : { customerId: cId, status: "PENDENTE" };
                const remaining = await this.saleModel.countDocuments(filter);
                if (remaining === 0) {
                    await this.saleModel.db.model("User").findByIdAndUpdate(cId, {
                        $set: { lastChargedAt: null, chargeCount: 0 }
                    }).exec();
                }
            }
            catch (e) {
            }
        }
        return updated;
    }
    async payAllCustomerSales(customerId) {
        const objectId = mongoose_2.Types.ObjectId.isValid(customerId) ? new mongoose_2.Types.ObjectId(customerId) : null;
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
        const totalPaid = (0, money_util_1.roundMoney)(pendingSales.reduce((acc, s) => acc + (s.totalPrice || 0), 0));
        const saleIds = pendingSales.map((s) => s._id);
        await this.saleModel
            .updateMany({ _id: { $in: saleIds } }, { $set: { status: "PAGO" } })
            .exec();
        try {
            await this.saleModel.db.model("User").findByIdAndUpdate(customerId, {
                $set: { lastChargedAt: null, chargeCount: 0 }
            }).exec();
        }
        catch (e) {
        }
        const customerObj = pendingSales[0].customerId;
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
        }
        catch (err) {
            console.error("Falha ao registrar log de quitação em massa:", err);
        }
        return { updatedCount: pendingSales.length, totalPaid };
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
                await this.productsService.incrementStock(productIdStr, item.quantity, sale.eventId ? sale.eventId.toString() : undefined);
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
    async returnItems(saleId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(saleId)) {
            throw new common_1.BadRequestException("ID de venda inválido");
        }
        const sale = await this.saleModel
            .findById(saleId)
            .populate("customerId")
            .populate("items.productId")
            .exec();
        if (!sale) {
            throw new common_1.NotFoundException(`Venda com ID ${saleId} não encontrada`);
        }
        if (sale.status === "CANCELADO") {
            throw new common_1.BadRequestException("Esta venda já foi cancelada anteriormente");
        }
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException("Nenhum item informado para devolução");
        }
        let totalRefundAmount = 0;
        const returnedDescriptions = [];
        for (const returnItem of dto.items) {
            const saleItem = sale.items.find((i) => {
                const prodId = i.productId?._id
                    ? i.productId._id.toString()
                    : i.productId.toString();
                return prodId === returnItem.productId;
            });
            if (!saleItem) {
                throw new common_1.BadRequestException(`O produto ${returnItem.productId} não pertence a esta venda`);
            }
            const alreadyReturned = saleItem.returnedQuantity || 0;
            const availableToReturn = saleItem.quantity - alreadyReturned;
            if (returnItem.quantity > availableToReturn) {
                const prodName = saleItem.productId?.name || "Produto";
                throw new common_1.BadRequestException(`Tentativa de devolver ${returnItem.quantity} un de ${prodName}, mas apenas ${availableToReturn} un estão disponíveis para devolução`);
            }
            const productIdStr = saleItem.productId?._id
                ? saleItem.productId._id.toString()
                : saleItem.productId.toString();
            try {
                await this.productsService.incrementStock(productIdStr, returnItem.quantity, sale.eventId ? sale.eventId.toString() : undefined);
            }
            catch (err) {
                console.error(`Falha ao repor estoque do produto ${productIdStr}:`, err);
            }
            saleItem.returnedQuantity = alreadyReturned + returnItem.quantity;
            const itemRefundValue = (0, money_util_1.roundMoney)(returnItem.quantity * saleItem.priceAtPurchase);
            totalRefundAmount = (0, money_util_1.roundMoney)(totalRefundAmount + itemRefundValue);
            const prodName = saleItem.productId?.name || "Produto";
            returnedDescriptions.push(`${returnItem.quantity}x ${prodName} (R$ ${itemRefundValue.toFixed(2)})`);
        }
        sale.totalPrice = Math.max(0, (0, money_util_1.roundMoney)(sale.totalPrice - totalRefundAmount));
        const operator = dto.operatorName || "Admin";
        if (sale.status === "PAGO") {
            sale.refundedAmount = (0, money_util_1.roundMoney)((sale.refundedAmount || 0) + totalRefundAmount);
            if (!sale.refunds)
                sale.refunds = [];
            sale.refunds.push({
                amount: totalRefundAmount,
                method: dto.refundMethod || "DINHEIRO",
                date: new Date(),
                reason: (dto.reason || "").trim(),
                operator,
            });
        }
        const allItemsFullyReturned = sale.items.every((i) => (i.returnedQuantity || 0) >= i.quantity);
        if (allItemsFullyReturned) {
            sale.status = "CANCELADO";
        }
        const savedSale = await sale.save();
        const customerName = sale.customerId?.firstName
            ? `${sale.customerId.firstName} ${sale.customerId.lastName || ""}`.trim()
            : "Cliente";
        try {
            await this.logsService.create({
                userId: dto.operatorId || "system",
                userName: operator,
                action: "sale_return_items",
                description: `${operator} registrou a devolução de itens [ ${returnedDescriptions.join(", ")} ] da venda #${saleId} do cliente ${customerName}. Valor estornado/abatido: R$ ${totalRefundAmount.toFixed(2)}. Status atual da venda: ${sale.status}.`,
                metadata: {
                    saleId: sale._id.toString(),
                    totalRefundAmount,
                    returnedItems: dto.items,
                    refundMethod: dto.refundMethod,
                    reason: dto.reason,
                    newTotalPrice: sale.totalPrice,
                    newStatus: sale.status,
                    eventId: sale.eventId,
                },
            });
        }
        catch (err) {
            console.error("Falha ao registrar log de devolução parcial:", err);
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