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
exports.CreateIncomeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateIncomeDto {
    eventId;
    title;
    type;
    amount;
    notes;
    operatorName;
}
exports.CreateIncomeDto = CreateIncomeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do evento é obrigatório" }),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O título da receita é obrigatório" }),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O tipo de receita é obrigatório" }),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O valor deve ser numérico" }),
    (0, class_validator_1.Min)(0.01, { message: "O valor arrecadado deve ser positivo" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateIncomeDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "operatorName", void 0);
//# sourceMappingURL=create-income.dto.js.map