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
exports.PaymentConfigService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const payment_config_schema_1 = require("../schemas/payment-config.schema");
let PaymentConfigService = class PaymentConfigService {
    paymentConfigModel;
    constructor(paymentConfigModel) {
        this.paymentConfigModel = paymentConfigModel;
    }
    async findAll() {
        const list = await this.paymentConfigModel
            .find({ active: { $ne: false } })
            .sort({ isDefault: -1, createdAt: -1 })
            .exec();
        if (list.length === 0) {
            const initial = await this.paymentConfigModel.create({
                pixKey: "homensdefe.pel@gmail.com",
                keyType: "EMAIL",
                merchantName: "Alcides",
                bankName: "Nubank",
                city: "Pelotas",
                description: "Chave Oficial do Retiro",
                isDefault: true,
                active: true,
            });
            return [initial];
        }
        return list;
    }
    async getActive() {
        let activeConfig = await this.paymentConfigModel
            .findOne({ active: { $ne: false }, isDefault: true })
            .exec();
        if (!activeConfig) {
            activeConfig = await this.paymentConfigModel
                .findOne({ active: { $ne: false } })
                .sort({ createdAt: -1 })
                .exec();
        }
        if (!activeConfig) {
            activeConfig = await this.paymentConfigModel.create({
                pixKey: "homensdefe.pel@gmail.com",
                keyType: "EMAIL",
                merchantName: "Alcides",
                bankName: "Nubank",
                city: "Pelotas",
                description: "Chave Oficial do Retiro",
                isDefault: true,
                active: true,
            });
        }
        return activeConfig;
    }
    async create(dto) {
        const shouldBeDefault = dto.isDefault ?? true;
        if (shouldBeDefault) {
            await this.paymentConfigModel.updateMany({}, { isDefault: false }).exec();
        }
        const created = await this.paymentConfigModel.create({
            ...dto,
            isDefault: shouldBeDefault,
            active: true,
        });
        return created;
    }
    async update(id, dto) {
        if (dto.isDefault) {
            await this.paymentConfigModel.updateMany({ _id: { $ne: id } }, { isDefault: false }).exec();
        }
        const updated = await this.paymentConfigModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: "after" }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Configuração de pagamento ${id} não encontrada.`);
        }
        return updated;
    }
    async setDefault(id) {
        await this.paymentConfigModel.updateMany({}, { isDefault: false }).exec();
        const updated = await this.paymentConfigModel.findByIdAndUpdate(id, { isDefault: true, active: true }, { returnDocument: "after" }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Configuração de pagamento ${id} não encontrada.`);
        }
        return updated;
    }
    async delete(id) {
        const updated = await this.paymentConfigModel.findByIdAndUpdate(id, { active: false, isDefault: false }, { returnDocument: "after" }).exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Configuração de pagamento ${id} não encontrada.`);
        }
        const remaining = await this.paymentConfigModel.findOne({ active: { $ne: false } }).exec();
        if (remaining) {
            remaining.isDefault = true;
            await remaining.save();
        }
        return updated;
    }
};
exports.PaymentConfigService = PaymentConfigService;
exports.PaymentConfigService = PaymentConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_config_schema_1.PaymentConfig.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PaymentConfigService);
//# sourceMappingURL=payment-config.service.js.map