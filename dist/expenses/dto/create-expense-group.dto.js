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
exports.CreateExpenseGroupDto = void 0;
const class_validator_1 = require("class-validator");
class CreateExpenseGroupDto {
    eventId;
    title;
    category;
    nature;
    description;
    operatorName;
}
exports.CreateExpenseGroupDto = CreateExpenseGroupDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do evento é obrigatório" }),
    __metadata("design:type", String)
], CreateExpenseGroupDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O título da despesa/obra é obrigatório" }),
    __metadata("design:type", String)
], CreateExpenseGroupDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGroupDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(["INFRAESTRUTURA", "OPERACIONAL", "LOJINHA_INVESTIMENTO", "LOJINHA_DOACAO"], { message: "Natureza inválida" }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGroupDto.prototype, "nature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGroupDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenseGroupDto.prototype, "operatorName", void 0);
//# sourceMappingURL=create-expense-group.dto.js.map