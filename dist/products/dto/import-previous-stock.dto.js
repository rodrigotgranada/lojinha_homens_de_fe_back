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
exports.ImportPreviousStockDto = exports.ReconciliationItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ReconciliationItemDto {
    productId;
    quantityToImport;
    writeOffQuantity;
    writeOffReason;
    writeOffNotes;
}
exports.ReconciliationItemDto = ReconciliationItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do produto anterior é obrigatório" }),
    __metadata("design:type", String)
], ReconciliationItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "A quantidade a importar deve ser numérica" }),
    (0, class_validator_1.Min)(0, { message: "A quantidade a importar não pode ser negativa" }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReconciliationItemDto.prototype, "quantityToImport", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "A quantidade a baixar deve ser numérica" }),
    (0, class_validator_1.Min)(0, { message: "A quantidade a baixar não pode ser negativa" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ReconciliationItemDto.prototype, "writeOffQuantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReconciliationItemDto.prototype, "writeOffReason", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReconciliationItemDto.prototype, "writeOffNotes", void 0);
class ImportPreviousStockDto {
    currentEventId;
    previousEventId;
    items;
    operatorName;
}
exports.ImportPreviousStockDto = ImportPreviousStockDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do evento atual é obrigatório" }),
    __metadata("design:type", String)
], ImportPreviousStockDto.prototype, "currentEventId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: "O ID do evento anterior é obrigatório" }),
    __metadata("design:type", String)
], ImportPreviousStockDto.prototype, "previousEventId", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: "A lista de itens deve ser um array" }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReconciliationItemDto),
    __metadata("design:type", Array)
], ImportPreviousStockDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ImportPreviousStockDto.prototype, "operatorName", void 0);
//# sourceMappingURL=import-previous-stock.dto.js.map