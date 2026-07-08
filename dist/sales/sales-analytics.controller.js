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
exports.SalesAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const sales_analytics_service_1 = require("./sales-analytics.service");
let SalesAnalyticsController = class SalesAnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getEventAnalytics(eventId) {
        return this.analyticsService.getEventAnalytics(eventId);
    }
};
exports.SalesAnalyticsController = SalesAnalyticsController;
__decorate([
    (0, common_1.Get)("event/:eventId"),
    __param(0, (0, common_1.Param)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesAnalyticsController.prototype, "getEventAnalytics", null);
exports.SalesAnalyticsController = SalesAnalyticsController = __decorate([
    (0, common_1.Controller)("sales/analytics"),
    __metadata("design:paramtypes", [sales_analytics_service_1.SalesAnalyticsService])
], SalesAnalyticsController);
//# sourceMappingURL=sales-analytics.controller.js.map