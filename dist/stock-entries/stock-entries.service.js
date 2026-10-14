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
var StockEntriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockEntriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const stock_entry_schema_1 = require("../schemas/stock-entry.schema");
const product_schema_1 = require("../schemas/product.schema");
const event_stock_schema_1 = require("../schemas/event-stock.schema");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
const logs_service_1 = require("../logs/logs.service");
const expenses_service_1 = require("../expenses/expenses.service");
const money_util_1 = require("../common/utils/money.util");
let StockEntriesService = StockEntriesService_1 = class StockEntriesService {
    stockEntryModel;
    productModel;
    eventStockModel;
    wsGateway;
    logsService;
    expensesService;
    logger = new common_1.Logger(StockEntriesService_1.name);
    constructor(stockEntryModel, productModel, eventStockModel, wsGateway, logsService, expensesService) {
        this.stockEntryModel = stockEntryModel;
        this.productModel = productModel;
        this.eventStockModel = eventStockModel;
        this.wsGateway = wsGateway;
        this.logsService = logsService;
        this.expensesService = expensesService;
    }
    async create(dto) {
        if (!mongoose_2.Types.ObjectId.isValid(dto.productId)) {
            throw new common_1.BadRequestException("ID de produto inválido");
        }
        const product = await this.productModel.findById(dto.productId).exec();
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID ${dto.productId} não encontrado`);
        }
        const quantity = Math.max(1, Math.floor(Number(dto.quantity) || 1));
        const costPrice = (0, money_util_1.roundMoney)(Number(dto.costPrice) || 0);
        const totalCost = dto.totalCost !== undefined
            ? (0, money_util_1.roundMoney)(Number(dto.totalCost))
            : (0, money_util_1.roundMoney)(quantity * costPrice);
        const isDonation = !!dto.isDonation;
        const eventId = dto.eventId && mongoose_2.Types.ObjectId.isValid(dto.eventId)
            ? dto.eventId
            : product.eventId
                ? product.eventId.toString()
                : undefined;
        const operatorName = dto.operatorName || "Admin";
        let expenseGroupId;
        let expenseItemId;
        if (eventId && mongoose_2.Types.ObjectId.isValid(eventId) && (totalCost > 0 || isDonation)) {
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
                    expenseGroupId = group._id;
                    if (addedGroup && addedGroup.items && addedGroup.items.length > 0) {
                        const lastItem = addedGroup.items[addedGroup.items.length - 1];
                        expenseItemId = lastItem._id;
                    }
                }
            }
            catch (err) {
                this.logger.error("Falha ao registrar despesa automática para entrada de estoque:", err);
            }
        }
        const stockEntry = new this.stockEntryModel({
            productId: product._id,
            eventId: eventId && mongoose_2.Types.ObjectId.isValid(eventId) ? new mongoose_2.Types.ObjectId(eventId) : undefined,
            quantity,
            costPrice,
            totalCost,
            sponsorName: (dto.sponsorName || "").trim(),
            sponsorCpf: (dto.sponsorCpf || "").trim(),
            sponsorPhone: (dto.sponsorPhone || "").trim(),
            sponsorUserId: dto.sponsorUserId && mongoose_2.Types.ObjectId.isValid(dto.sponsorUserId)
                ? new mongoose_2.Types.ObjectId(dto.sponsorUserId)
                : undefined,
            isDonation,
            date: dto.date ? new Date(dto.date) : new Date(),
            notes: (dto.notes || "").trim(),
            operatorName,
            createdBy: dto.createdBy && mongoose_2.Types.ObjectId.isValid(dto.createdBy)
                ? new mongoose_2.Types.ObjectId(dto.createdBy)
                : undefined,
            expenseGroupId,
            expenseItemId,
        });
        const savedEntry = await stockEntry.save();
        if (eventId && mongoose_2.Types.ObjectId.isValid(eventId)) {
            const eventObjId = new mongoose_2.Types.ObjectId(eventId);
            await this.eventStockModel.updateOne({ eventId: eventObjId, productId: product._id }, {
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
            }, { upsert: true }).exec();
        }
        const updatedProduct = await this.productModel
            .findByIdAndUpdate(product._id, {
            $inc: {
                stock: quantity,
                initialStock: quantity,
                totalCost: isDonation ? 0 : totalCost,
            },
        }, { new: true })
            .populate("categoryRef")
            .exec();
        if (updatedProduct) {
            this.wsGateway.broadcastStockChange(product.id, updatedProduct.stock);
            this.wsGateway.broadcastProductChange(updatedProduct);
        }
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
    async findByProduct(productId) {
        if (!mongoose_2.Types.ObjectId.isValid(productId)) {
            throw new common_1.BadRequestException("ID de produto inválido");
        }
        return this.stockEntryModel
            .find({ productId: new mongoose_2.Types.ObjectId(productId) })
            .sort({ date: -1, createdAt: -1 })
            .populate("sponsorUserId", "firstName lastName cpf phone")
            .exec();
    }
    async findByEvent(eventId) {
        if (!mongoose_2.Types.ObjectId.isValid(eventId)) {
            throw new common_1.BadRequestException("ID de evento inválido");
        }
        return this.stockEntryModel
            .find({ eventId: new mongoose_2.Types.ObjectId(eventId) })
            .sort({ date: -1, createdAt: -1 })
            .populate("productId")
            .populate("sponsorUserId", "firstName lastName cpf phone")
            .exec();
    }
    async findAll(productId, eventId) {
        const filter = {};
        if (productId && mongoose_2.Types.ObjectId.isValid(productId)) {
            filter.productId = new mongoose_2.Types.ObjectId(productId);
        }
        if (eventId && mongoose_2.Types.ObjectId.isValid(eventId)) {
            filter.eventId = new mongoose_2.Types.ObjectId(eventId);
        }
        return this.stockEntryModel
            .find(filter)
            .sort({ date: -1, createdAt: -1 })
            .populate("productId")
            .populate("sponsorUserId", "firstName lastName cpf phone")
            .exec();
    }
    async findOne(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException("ID de entrada inválido");
        }
        const entry = await this.stockEntryModel
            .findById(id)
            .populate("productId")
            .populate("sponsorUserId", "firstName lastName cpf phone")
            .exec();
        if (!entry) {
            throw new common_1.NotFoundException(`Entrada de estoque #${id} não encontrada`);
        }
        return entry;
    }
    async delete(id, operatorName = "Admin") {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException("ID de entrada inválido");
        }
        const entry = await this.stockEntryModel.findById(id).exec();
        if (!entry) {
            throw new common_1.NotFoundException(`Entrada de estoque #${id} não encontrada`);
        }
        if (entry.eventId) {
            await this.eventStockModel.updateOne({ eventId: entry.eventId, productId: entry.productId }, {
                $inc: {
                    stock: -entry.quantity,
                    initialStock: -entry.quantity,
                    totalCost: -(entry.isDonation ? 0 : entry.totalCost),
                },
            }).exec();
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
        if (entry.expenseGroupId && entry.expenseItemId) {
            try {
                await this.expensesService.deleteItem(entry.expenseGroupId.toString(), entry.expenseItemId.toString(), operatorName);
            }
            catch (err) {
                this.logger.warn(`Não foi possível remover o item de despesa vinculado à entrada de estoque #${id}:`, err);
            }
        }
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
};
exports.StockEntriesService = StockEntriesService;
exports.StockEntriesService = StockEntriesService = StockEntriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(stock_entry_schema_1.StockEntry.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(event_stock_schema_1.EventStock.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        websocket_gateway_1.WebsocketGateway,
        logs_service_1.LogsService,
        expenses_service_1.ExpensesService])
], StockEntriesService);
//# sourceMappingURL=stock-entries.service.js.map