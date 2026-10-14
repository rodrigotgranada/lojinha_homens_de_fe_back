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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sale_schema_1 = require("../schemas/sale.schema");
const user_schema_1 = require("../schemas/user.schema");
const product_schema_1 = require("../schemas/product.schema");
const category_schema_1 = require("../schemas/category.schema");
const event_schema_1 = require("../schemas/event.schema");
let SyncService = SyncService_1 = class SyncService {
    configService;
    saleModel;
    userModel;
    productModel;
    categoryModel;
    eventModel;
    logger = new common_1.Logger(SyncService_1.name);
    isSyncing = false;
    lastPullTimestamp = 0;
    constructor(configService, saleModel, userModel, productModel, categoryModel, eventModel) {
        this.configService = configService;
        this.saleModel = saleModel;
        this.userModel = userModel;
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.eventModel = eventModel;
    }
    onApplicationBootstrap() {
        const isLocalServer = this.configService.get("IS_LOCAL_SERVER") === "true";
        if (isLocalServer) {
            this.logger.log("INICIANDO SERVIÇO DE SINCRONIZAÇÃO LOCAL NO NOTEBOOK...");
            const intervalMs = parseInt(this.configService.get("SYNC_INTERVAL_MS") || "30000", 10);
            this.logger.log("Sincronização automática em segundo plano DESATIVADA (Apenas manual).");
        }
        else {
            this.logger.log("Servidor rodando em ambiente de NUVEM. Serviço de sincronização local inativo.");
        }
    }
    async runSyncCycle() {
        if (this.isSyncing)
            return;
        this.isSyncing = true;
        try {
            const remoteUrl = this.configService.get("REMOTE_API_URL");
            if (!remoteUrl) {
                this.logger.warn("REMOTE_API_URL não configurada no arquivo .env. Pulando sincronização.");
                this.isSyncing = false;
                return;
            }
            const isOnline = await this.checkRemoteConnectivity(remoteUrl);
            if (!isOnline) {
                this.isSyncing = false;
                return;
            }
            this.logger.log("Conectividade com a Nuvem restabelecida. Iniciando ciclo...");
            await this.pushLocalDataToRemote(remoteUrl);
            await this.pullRemoteDataToLocal(remoteUrl);
            this.logger.log("Ciclo de sincronização finalizado com sucesso.");
        }
        catch (err) {
            this.logger.error("Erro durante o ciclo de sincronização:", err.message);
        }
        finally {
            this.isSyncing = false;
        }
    }
    async checkRemoteConnectivity(remoteUrl) {
        try {
            const response = await fetch(`${remoteUrl}/sync/health`, { signal: AbortSignal.timeout(30000) });
            if (!response.ok) {
                this.logger.warn(`Servidor remoto respondeu com status inválido no health: ${response.status}. Pulando sincronização.`);
                return false;
            }
            return true;
        }
        catch (e) {
            this.logger.warn(`Sem internet ou servidor remoto indisponível em ${remoteUrl}. Aguardando próxima rodada.`);
            return false;
        }
    }
    async pushLocalDataToRemote(remoteUrl) {
        const pendingSales = await this.saleModel.find({ synced: { $ne: true } }).exec();
        const pendingUsers = await this.userModel.find({ synced: { $ne: true } }).exec();
        if (pendingSales.length === 0 && pendingUsers.length === 0) {
            this.logger.log("Nenhum dado pendente de sincronização para envio (Push).");
            return;
        }
        this.logger.log(`Encontrados para PUSH: ${pendingSales.length} vendas e ${pendingUsers.length} usuários.`);
        try {
            const payload = {
                sales: pendingSales,
                users: pendingUsers
            };
            const response = await fetch(`${remoteUrl}/sync/push`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`Servidor remoto respondeu com status ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                this.logger.log("Dados enviados e aceitos pela nuvem com sucesso.");
                if (pendingSales.length > 0) {
                    const saleIds = pendingSales.map(s => s._id);
                    await this.saleModel.updateMany({ _id: { $in: saleIds } }, { $set: { synced: true, synchronizedAt: new Date() } }).exec();
                }
                if (pendingUsers.length > 0) {
                    const userIds = pendingUsers.map(u => u._id);
                    await this.userModel.updateMany({ _id: { $in: userIds } }, { $set: { synced: true, synchronizedAt: new Date() } }).exec();
                }
                this.logger.log("Status de sincronização local atualizado.");
            }
            else {
                this.logger.warn(`A nuvem processou o PUSH mas reportou erros parciais: ${result.errors?.join(" | ")}`);
            }
        }
        catch (err) {
            this.logger.error("Falha ao enviar dados pendentes (Push):", err.message);
            throw err;
        }
    }
    async pullRemoteDataToLocal(remoteUrl) {
        this.logger.log(`Iniciando PULL de atualizações na Nuvem desde timestamp: ${new Date(this.lastPullTimestamp).toISOString()}`);
        try {
            const response = await fetch(`${remoteUrl}/sync/pull?lastSyncDate=${this.lastPullTimestamp}`);
            if (!response.ok) {
                throw new Error(`Servidor remoto respondeu com status ${response.status}`);
            }
            const data = await response.json();
            const hasUpdates = (data.categories?.length || 0) +
                (data.events?.length || 0) +
                (data.products?.length || 0) +
                (data.users?.length || 0) +
                (data.sales?.length || 0) > 0;
            if (!hasUpdates) {
                this.lastPullTimestamp = data.timestamp || Date.now();
                return;
            }
            this.logger.log(`Atualizações encontradas na Nuvem: Categorias (${data.categories?.length || 0}), Eventos (${data.events?.length || 0}), Produtos (${data.products?.length || 0}), Usuários (${data.users?.length || 0}), Vendas (${data.sales?.length || 0})`);
            if (data.categories?.length > 0) {
                for (const cat of data.categories) {
                    const { _id, id, __v, ...cleanCat } = cat;
                    await this.categoryModel.findByIdAndUpdate(_id || id, { $set: cleanCat }, { upsert: true, returnDocument: 'after' }).exec();
                }
            }
            if (data.events?.length > 0) {
                for (const ev of data.events) {
                    const { _id, id, __v, ...cleanEv } = ev;
                    await this.eventModel.findByIdAndUpdate(_id || id, { $set: cleanEv }, { upsert: true, returnDocument: 'after' }).exec();
                }
            }
            if (data.products?.length > 0) {
                for (const prod of data.products) {
                    const { _id, id, __v, ...cleanProd } = prod;
                    await this.productModel.findByIdAndUpdate(_id || id, { $set: cleanProd }, { upsert: true, returnDocument: 'after' }).exec();
                }
            }
            if (data.users?.length > 0) {
                for (const user of data.users) {
                    const { _id, id, __v, ...cleanUser } = user;
                    let targetId = _id || id;
                    if (cleanUser.cpf) {
                        const existingUser = await this.userModel.findOne({ cpf: cleanUser.cpf }).exec();
                        if (existingUser) {
                            targetId = existingUser._id;
                        }
                    }
                    cleanUser.synced = true;
                    cleanUser.synchronizedAt = new Date();
                    await this.userModel.findByIdAndUpdate(targetId, { $set: cleanUser }, { upsert: true, returnDocument: 'after' }).exec();
                }
            }
            if (data.sales?.length > 0) {
                for (const sale of data.sales) {
                    const { _id, id, __v, ...cleanSale } = sale;
                    cleanSale.synced = true;
                    cleanSale.synchronizedAt = new Date();
                    await this.saleModel.findByIdAndUpdate(_id || id, { $set: cleanSale }, { upsert: true, returnDocument: 'after' }).exec();
                }
            }
            this.lastPullTimestamp = data.timestamp || Date.now();
            this.logger.log(`Pull completo. Novo timestamp de sincronização: ${new Date(this.lastPullTimestamp).toISOString()}`);
        }
        catch (err) {
            this.logger.error("Falha ao puxar atualizações (Pull):", err.message);
            throw err;
        }
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(4, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(5, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], SyncService);
//# sourceMappingURL=sync.service.js.map