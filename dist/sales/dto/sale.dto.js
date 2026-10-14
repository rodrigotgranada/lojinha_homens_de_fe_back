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
exports.ReturnSaleItemsDto = exports.ReturnItemDto = exports.UpdateSaleStatusDto = exports.CancelSaleDto = exports.CreateSaleDto = exports.CreateSaleItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateSaleItemDto {
    productId;
    quantity;
    priceAtPurchase;
    costAtPurchase;
}
exports.CreateSaleItemDto = CreateSaleItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do produto é obrigatório" }),
    __metadata("design:type", String)
], CreateSaleItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "A quantidade deve ser numérica" }),
    (0, class_validator_1.Min)(1, { message: "A quantidade deve ser pelo menos 1" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O preço deve ser numérico" }),
    (0, class_validator_1.Min)(0, { message: "O preço não pode ser negativo" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "priceAtPurchase", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O custo deve ser numérico" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSaleItemDto.prototype, "costAtPurchase", void 0);
class CreateSaleDto {
    customerId;
    eventId;
    items;
    totalPrice;
    status;
    operatorId;
}
exports.CreateSaleDto = CreateSaleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do cliente é obrigatório" }),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do evento é obrigatório" }),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: "A lista de itens deve ser um array" }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateSaleItemDto),
    __metadata("design:type", Array)
], CreateSaleDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "O preço total deve ser numérico" }),
    (0, class_validator_1.Min)(0, { message: "O preço total não pode ser negativo" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSaleDto.prototype, "totalPrice", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSaleDto.prototype, "operatorId", void 0);
class CancelSaleDto {
    operatorId;
}
exports.CancelSaleDto = CancelSaleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CancelSaleDto.prototype, "operatorId", void 0);
class UpdateSaleStatusDto {
    status;
}
exports.UpdateSaleStatusDto = UpdateSaleStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O status é obrigatório" }),
    __metadata("design:type", String)
], UpdateSaleStatusDto.prototype, "status", void 0);
class ReturnItemDto {
    productId;
    quantity;
}
exports.ReturnItemDto = ReturnItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do produto é obrigatório" }),
    __metadata("design:type", String)
], ReturnItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "A quantidade a devolver deve ser numérica" }),
    (0, class_validator_1.Min)(1, { message: "A quantidade a devolver deve ser pelo menos 1" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReturnItemDto.prototype, "quantity", void 0);
class ReturnSaleItemsDto {
    items;
    reason;
    refundMethod;
    operatorId;
    operatorName;
}
exports.ReturnSaleItemsDto = ReturnSaleItemsDto;
__decorate([
    (0, class_validator_1.IsArray)({ message: "A lista de itens a devolver deve ser um array" }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReturnItemDto),
    __metadata("design:type", Array)
], ReturnSaleItemsDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnSaleItemsDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnSaleItemsDto.prototype, "refundMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnSaleItemsDto.prototype, "operatorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReturnSaleItemsDto.prototype, "operatorName", void 0);
//# sourceMappingURL=sale.dto.js.map