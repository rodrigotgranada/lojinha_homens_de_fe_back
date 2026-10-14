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
var SyncController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sync_service_1 = require("./sync.service");
const sale_schema_1 = require("../schemas/sale.schema");
const user_schema_1 = require("../schemas/user.schema");
const product_schema_1 = require("../schemas/product.schema");
const category_schema_1 = require("../schemas/category.schema");
const event_schema_1 = require("../schemas/event.schema");
let SyncController = SyncController_1 = class SyncController {
    syncService;
    saleModel;
    userModel;
    productModel;
    categoryModel;
    eventModel;
    logger = new common_1.Logger(SyncController_1.name);
    constructor(syncService, saleModel, userModel, productModel, categoryModel, eventModel) {
        this.syncService = syncService;
        this.saleModel = saleModel;
        this.userModel = userModel;
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.eventModel = eventModel;
    }
    healthCheck() {
        return { status: "ok", timestamp: Date.now() };
    }
    async triggerSync() {
        this.syncService.runSyncCycle().catch(err => {
            this.logger.error("Erro ao disparar ciclo de sync sob demanda:", err.message);
        });
        return { status: "triggered" };
    }
    async pushData(payload) {
        this.logger.log(`Recebendo PUSH da Nuvem: ${payload.sales?.length || 0} vendas e ${payload.users?.length || 0} usuários.`);
        const errors = [];
        if (payload.users && payload.users.length > 0) {
            for (const userData of payload.users) {
                try {
                    const { _id, id, __v, ...cleanUserData } = userData;
                    let targetId = _id || id;
                    if (cleanUserData.cpf) {
                        const existingUser = await this.userModel.findOne({ cpf: cleanUserData.cpf }).exec();
                        if (existingUser) {
                            targetId = existingUser._id;
                        }
                    }
                    cleanUserData.synced = true;
                    cleanUserData.synchronizedAt = new Date();
                    await this.userModel.findByIdAndUpdate(targetId, { $set: cleanUserData }, { upsert: true, returnDocument: 'after' }).exec();
                }
                catch (err) {
                    this.logger.error(`Erro ao processar PUSH de usuário: ${err.message}`);
                    errors.push(`User error (${userData.cpf || userData.email}): ${err.message}`);
                }
            }
        }
        if (payload.sales && payload.sales.length > 0) {
            for (const saleData of payload.sales) {
                try {
                    const { _id, id, __v, ...cleanSaleData } = saleData;
                    const targetId = _id || id;
                    cleanSaleData.synced = true;
                    cleanSaleData.synchronizedAt = new Date();
                    await this.saleModel.findByIdAndUpdate(targetId, { $set: cleanSaleData }, { upsert: true, returnDocument: 'after' }).exec();
                }
                catch (err) {
                    this.logger.error(`Erro ao processar PUSH de venda: ${err.message}`);
                    errors.push(`Sale error (${saleData._id}): ${err.message}`);
                }
            }
        }
        if (errors.length > 0) {
            this.logger.warn(`PUSH concluído com ${errors.length} erros parciais.`);
            return { success: false, errors };
        }
        return { success: true };
    }
    async pullData(lastSyncDate) {
        const timestamp = parseInt(lastSyncDate || "0", 10);
        const filterDate = new Date(timestamp);
        this.logger.log(`Recebendo PULL da Nuvem. Filtrando atualizações a partir de: ${filterDate.toISOString()}`);
        const categories = await this.categoryModel.find({
            updatedAt: { $gt: filterDate }
        }).exec();
        const events = await this.eventModel.find({
            updatedAt: { $gt: filterDate }
        }).exec();
        const products = await this.productModel.find({
            updatedAt: { $gt: filterDate }
        }).exec();
        const users = await this.userModel.find({
            updatedAt: { $gt: filterDate }
        }).exec();
        const sales = await this.saleModel.find({
            updatedAt: { $gt: filterDate }
        }).exec();
        return {
            categories,
            events,
            products,
            users,
            sales,
            timestamp: Date.now()
        };
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, common_1.Get)("health"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SyncController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)("trigger"),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "triggerSync", null);
__decorate([
    (0, common_1.Post)("push"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "pushData", null);
__decorate([
    (0, common_1.Get)("pull"),
    __param(0, (0, common_1.Query)("lastSyncDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "pullData", null);
exports.SyncController = SyncController = SyncController_1 = __decorate([
    (0, common_1.Controller)("sync"),
    __param(1, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(4, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(5, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [sync_service_1.SyncService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SyncController);
//# sourceMappingURL=sync.controller.js.map