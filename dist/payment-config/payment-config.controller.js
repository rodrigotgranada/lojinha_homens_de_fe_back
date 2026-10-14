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
exports.PaymentConfigController = void 0;
const common_1 = require("@nestjs/common");
const payment_config_service_1 = require("./payment-config.service");
const payment_config_dto_1 = require("./dto/payment-config.dto");
let PaymentConfigController = class PaymentConfigController {
    paymentConfigService;
    constructor(paymentConfigService) {
        this.paymentConfigService = paymentConfigService;
    }
    async findAll() {
        return this.paymentConfigService.findAll();
    }
    async getActive() {
        return this.paymentConfigService.getActive();
    }
    async create(dto) {
        return this.paymentConfigService.create(dto);
    }
    async update(id, dto) {
        return this.paymentConfigService.update(id, dto);
    }
    async setDefault(id) {
        return this.paymentConfigService.setDefault(id);
    }
    async delete(id) {
        return this.paymentConfigService.delete(id);
    }
};
exports.PaymentConfigController = PaymentConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentConfigController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("active"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentConfigController.prototype, "getActive", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_config_dto_1.CreatePaymentConfigDto]),
    __metadata("design:returntype", Promise)
], PaymentConfigController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payment_config_dto_1.UpdatePaymentConfigDto]),
    __metadata("design:returntype", Promise)
], PaymentConfigController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(":id/default"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentConfigController.prototype, "setDefault", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentConfigController.prototype, "delete", null);
exports.PaymentConfigController = PaymentConfigController = __decorate([
    (0, common_1.Controller)("payment-configs"),
    __metadata("design:paramtypes", [payment_config_service_1.PaymentConfigService])
], PaymentConfigController);
//# sourceMappingURL=payment-config.controller.js.map