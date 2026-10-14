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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRepaymentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AddRepaymentDto {
    amount;
    method;
    proofUrl;
    operatorName;
    notes;
}
exports.AddRepaymentDto = AddRepaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O valor da parcela deve ser numérico" }),
    (0, class_validator_1.Min)(0.01, { message: "O valor do reembolso deve ser maior que zero" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], AddRepaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddRepaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddRepaymentDto.prototype, "proofUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddRepaymentDto.prototype, "operatorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddRepaymentDto.prototype, "notes", void 0);
//# sourceMappingURL=add-repayment.dto.js.map