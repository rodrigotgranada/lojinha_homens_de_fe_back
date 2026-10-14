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
exports.UpdateExpenseItemDto = exports.CreateExpenseItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateExpenseItemDto {
    description;
    amount;
    paidBy;
    payerPhone;
    isDonation;
    notes;
    receiptUrl;
    operatorName;
}
exports.CreateExpenseItemDto = CreateExpenseItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "A descrição do item é obrigatória" }),
    __metadata("design:type", String)
], CreateExpenseItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O valor deve ser numérico" }),
    (0, class_validator_1.Min)(0, { message: "O valor não pode ser negativo" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateExpenseItemDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O pagador/voluntário é obrigatório" }),
    __metadata("design:type", String)
], CreateExpenseItemDto.prototype, "paidBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseItemDto.prototype, "payerPhone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateExpenseItemDto.prototype, "isDonation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseItemDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseItemDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseItemDto.prototype, "operatorName", void 0);
class UpdateExpenseItemDto {
    description;
    amount;
    paidBy;
    payerPhone;
    isDonation;
    status;
    repaidAmount;
    notes;
    receiptUrl;
    operatorName;
}
exports.UpdateExpenseItemDto = UpdateExpenseItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O valor deve ser numérico" }),
    (0, class_validator_1.Min)(0, { message: "O valor não pode ser negativo" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateExpenseItemDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "paidBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "payerPhone", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateExpenseItemDto.prototype, "isDonation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O valor reembolsado deve ser numérico" }),
    (0, class_validator_1.Min)(0, { message: "O valor reembolsado não pode ser negativo" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateExpenseItemDto.prototype, "repaidAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpenseItemDto.prototype, "operatorName", void 0);
//# sourceMappingURL=create-expense-item.dto.js.map