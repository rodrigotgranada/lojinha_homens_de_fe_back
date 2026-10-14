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
exports.StockEntriesController = void 0;
const common_1 = require("@nestjs/common");
const stock_entries_service_1 = require("./stock-entries.service");
const stock_entry_dto_1 = require("./dto/stock-entry.dto");
let StockEntriesController = class StockEntriesController {
    stockEntriesService;
    constructor(stockEntriesService) {
        this.stockEntriesService = stockEntriesService;
    }
    async findAll(productId, eventId) {
        return this.stockEntriesService.findAll(productId, eventId);
    }
    async findByProduct(productId) {
        return this.stockEntriesService.findByProduct(productId);
    }
    async findByEvent(eventId) {
        return this.stockEntriesService.findByEvent(eventId);
    }
    async findOne(id) {
        return this.stockEntriesService.findOne(id);
    }
    async create(createDto) {
        return this.stockEntriesService.create(createDto);
    }
    async delete(id, operatorName) {
        return this.stockEntriesService.delete(id, operatorName);
    }
};
exports.StockEntriesController = StockEntriesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("productId")),
    __param(1, (0, common_1.Query)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StockEntriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("product/:productId"),
    __param(0, (0, common_1.Param)("productId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockEntriesController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)("event/:eventId"),
    __param(0, (0, common_1.Param)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockEntriesController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StockEntriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_entry_dto_1.CreateStockEntryDto]),
    __metadata("design:returntype", Promise)
], StockEntriesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("operatorName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StockEntriesController.prototype, "delete", null);
exports.StockEntriesController = StockEntriesController = __decorate([
    (0, common_1.Controller)("stock-entries"),
    __metadata("design:paramtypes", [stock_entries_service_1.StockEntriesService])
], StockEntriesController);
//# sourceMappingURL=stock-entries.controller.js.map