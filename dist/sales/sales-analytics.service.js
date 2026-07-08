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
exports.SalesAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const sale_schema_1 = require("../schemas/sale.schema");
let SalesAnalyticsService = class SalesAnalyticsService {
    saleModel;
    constructor(saleModel) {
        this.saleModel = saleModel;
    }
    async getEventAnalytics(eventId) {
        if (!eventId || !mongoose_2.Types.ObjectId.isValid(eventId)) {
            return {
                summary: {
                    totalRevenue: 0,
                    pendingRevenue: 0,
                    totalSalesCount: 0,
                    pagoCount: 0,
                    pendenteCount: 0,
                    ticketMedio: 0
                },
                topSellingProducts: [],
                topBuyers: [],
                salesTimeline: []
            };
        }
        const saleEventId = new mongoose_2.Types.ObjectId(eventId);
        console.log(`[SalesAnalyticsService] Querying sales for eventId: "${eventId}" (ObjectId: ${saleEventId.toString()})`);
        const sales = await this.saleModel
            .find({
            $or: [
                { eventId: saleEventId },
                { eventId: eventId }
            ],
            status: { $ne: "CANCELADO" }
        })
            .populate({
            path: "items.productId",
            populate: { path: "categoryRef" }
        })
            .populate("customerId")
            .exec();
        console.log(`[SalesAnalyticsService] Found ${sales.length} sales matching eventId ${eventId}`);
        const totalRevenue = sales
            .filter((s) => s.status === "PAGO")
            .reduce((acc, s) => acc + s.totalPrice, 0);
        const pendingRevenue = sales
            .filter((s) => s.status === "PENDENTE")
            .reduce((acc, s) => acc + s.totalPrice, 0);
        const totalSalesCount = sales.length;
        const pagoCount = sales.filter((s) => s.status === "PAGO").length;
        const pendenteCount = sales.filter((s) => s.status === "PENDENTE").length;
        const ticketMedio = totalSalesCount > 0 ? (totalRevenue + pendingRevenue) / totalSalesCount : 0;
        const productStats = {};
        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                const prod = item.productId;
                if (!prod)
                    return;
                const prodId = prod._id?.toString() || "unknown";
                const prodName = prod.name || "Produto Removido";
                const categoryName = prod.categoryRef?.name || "Outros";
                if (!productStats[prodId]) {
                    productStats[prodId] = {
                        name: prodName,
                        quantity: 0,
                        revenue: 0,
                        category: categoryName
                    };
                }
                productStats[prodId].quantity += item.quantity;
                productStats[prodId].revenue += item.quantity * item.priceAtPurchase;
            });
        });
        const topSellingProducts = Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        const buyerStats = {};
        sales.forEach((sale) => {
            const customer = sale.customerId;
            if (!customer)
                return;
            const custId = customer._id?.toString();
            const customerName = `${customer.firstName} ${customer.lastName}`;
            if (!buyerStats[custId]) {
                buyerStats[custId] = {
                    name: customerName,
                    totalSpent: 0,
                    cpf: customer.cpf || "",
                    purchasesCount: 0
                };
            }
            buyerStats[custId].totalSpent += sale.totalPrice;
            buyerStats[custId].purchasesCount += 1;
        });
        const topBuyers = Object.values(buyerStats)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10);
        const hourlyRevenue = {};
        sales.forEach((sale) => {
            const saleAny = sale;
            if (!saleAny.createdAt)
                return;
            const date = new Date(saleAny.createdAt);
            const hourStr = `${date.getHours().toString().padStart(2, "0")}:00`;
            hourlyRevenue[hourStr] = (hourlyRevenue[hourStr] || 0) + sale.totalPrice;
        });
        const salesTimeline = Object.entries(hourlyRevenue)
            .map(([time, amount]) => ({ time, amount }))
            .sort((a, b) => a.time.localeCompare(b.time));
        return {
            summary: {
                totalRevenue,
                pendingRevenue,
                totalSalesCount,
                pagoCount,
                pendenteCount,
                ticketMedio
            },
            topSellingProducts,
            topBuyers,
            salesTimeline
        };
    }
};
exports.SalesAnalyticsService = SalesAnalyticsService;
exports.SalesAnalyticsService = SalesAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SalesAnalyticsService);
//# sourceMappingURL=sales-analytics.service.js.map