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
const product_schema_1 = require("../schemas/product.schema");
const money_util_1 = require("../common/utils/money.util");
let SalesAnalyticsService = class SalesAnalyticsService {
    saleModel;
    productModel;
    constructor(saleModel, productModel) {
        this.saleModel = saleModel;
        this.productModel = productModel;
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
                    ticketMedio: 0,
                },
                topSellingProducts: [],
                topBuyers: [],
                salesTimeline: [],
            };
        }
        const saleEventId = new mongoose_2.Types.ObjectId(eventId);
        const sales = await this.saleModel
            .find({
            $or: [
                { eventId: saleEventId },
                { eventId: eventId },
            ],
            status: { $ne: "CANCELADO" },
        })
            .populate({
            path: "items.productId",
            populate: { path: "categoryRef" },
        })
            .populate("customerId")
            .exec();
        const totalRevenue = (0, money_util_1.roundMoney)(sales
            .filter((s) => s.status === "PAGO")
            .reduce((acc, s) => acc + s.totalPrice, 0));
        const pendingRevenue = (0, money_util_1.roundMoney)(sales
            .filter((s) => s.status === "PENDENTE")
            .reduce((acc, s) => acc + s.totalPrice, 0));
        const totalCost = (0, money_util_1.roundMoney)(sales
            .filter((s) => s.status === "PAGO")
            .reduce((acc, s) => {
            const saleCost = s.items.reduce((sum, item) => {
                const prodObj = item.productId;
                const currentProdCost = prodObj?.costPrice ?? 0;
                const itemCost = item.costAtPurchase && item.costAtPurchase > 0
                    ? item.costAtPurchase
                    : currentProdCost;
                return sum + item.quantity * itemCost;
            }, 0);
            return acc + saleCost;
        }, 0));
        const totalProfit = (0, money_util_1.roundMoney)(totalRevenue - totalCost);
        const profitMargin = totalRevenue > 0 ? (0, money_util_1.roundMoney)((totalProfit / totalRevenue) * 100) : 0;
        const totalSalesCount = sales.length;
        const pagoCount = sales.filter((s) => s.status === "PAGO").length;
        const pendenteCount = sales.filter((s) => s.status === "PENDENTE").length;
        const ticketMedio = totalSalesCount > 0
            ? (0, money_util_1.roundMoney)((totalRevenue + pendingRevenue) / totalSalesCount)
            : 0;
        const productStats = {};
        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                const prod = item.productId;
                if (!prod)
                    return;
                const prodId = prod._id?.toString() || "unknown";
                const prodName = prod.name || "Produto Removido";
                const categoryName = prod.categoryRef?.name || "Outros";
                const sponsorName = prod.sponsorName || "Retiro / Sem Patrocinador";
                const currentProdCost = prod.costPrice ?? 0;
                const itemCost = item.costAtPurchase && item.costAtPurchase > 0
                    ? item.costAtPurchase
                    : currentProdCost;
                if (!productStats[prodId]) {
                    productStats[prodId] = {
                        name: prodName,
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                        category: categoryName,
                        sponsorName,
                    };
                }
                const itemRev = (0, money_util_1.roundMoney)(item.quantity * item.priceAtPurchase);
                const itemTotalCost = (0, money_util_1.roundMoney)(item.quantity * itemCost);
                productStats[prodId].quantity += item.quantity;
                productStats[prodId].revenue = (0, money_util_1.roundMoney)(productStats[prodId].revenue + itemRev);
                productStats[prodId].cost = (0, money_util_1.roundMoney)(productStats[prodId].cost + itemTotalCost);
                productStats[prodId].profit = (0, money_util_1.roundMoney)(productStats[prodId].profit + (itemRev - itemTotalCost));
            });
        });
        const topSellingProducts = Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        const eventProducts = await this.productModel.find({
            $or: [
                { eventId: saleEventId },
                { eventId: eventId },
                { eventId: null },
                { eventId: { $exists: false } }
            ]
        }).exec();
        const productSalesMap = {};
        sales.filter(s => s.status === "PAGO").forEach(sale => {
            sale.items.forEach(item => {
                const prodIdObj = item.productId;
                const pId = prodIdObj._id?.toString() || item.productId.toString();
                if (!productSalesMap[pId]) {
                    productSalesMap[pId] = { quantity: 0, revenue: 0 };
                }
                productSalesMap[pId].quantity += item.quantity;
                productSalesMap[pId].revenue += item.quantity * item.priceAtPurchase;
            });
        });
        const investorsMap = {};
        eventProducts.forEach((prod) => {
            const pId = prod._id.toString();
            const prodObj = prod;
            const sponsor = (prodObj.sponsorName && prodObj.sponsorName.trim() !== "") ? prodObj.sponsorName : "Fundo Próprio / Retiro";
            const isDonation = prodObj.isDonation || false;
            const investedAmount = prodObj.totalCost || 0;
            const salesData = productSalesMap[pId] || { quantity: 0, revenue: 0 };
            const soldQty = salesData.quantity;
            const totalRev = salesData.revenue;
            const initialStk = prod.initialStock || (prod.stock + soldQty) || 1;
            const unitCost = investedAmount / initialStk;
            let costToRepay = isDonation ? 0 : (0, money_util_1.roundMoney)(unitCost * soldQty);
            if (costToRepay > investedAmount)
                costToRepay = investedAmount;
            const totalProfit = (0, money_util_1.roundMoney)(totalRev - costToRepay);
            if (!investorsMap[sponsor]) {
                investorsMap[sponsor] = {
                    sponsorName: sponsor,
                    products: [],
                    totalInvested: 0,
                    totalSoldQuantity: 0,
                    totalRevenue: 0,
                    totalToRepay: 0,
                    totalProfitForRetreat: 0,
                    repaymentProgress: 0,
                };
            }
            const prodItem = {
                productId: pId,
                name: prod.name,
                costPrice: isDonation ? 0 : (0, money_util_1.roundMoney)(unitCost),
                salePrice: prod.price,
                initialStock: prod.initialStock || prod.stock,
                currentStock: prod.stock,
                soldQuantity: soldQty,
                totalRevenue: (0, money_util_1.roundMoney)(totalRev),
                costToRepay,
                totalProfit,
                investedAmount: isDonation ? 0 : investedAmount,
            };
            investorsMap[sponsor].products.push(prodItem);
            investorsMap[sponsor].totalInvested = (0, money_util_1.roundMoney)(investorsMap[sponsor].totalInvested + prodItem.investedAmount);
            investorsMap[sponsor].totalSoldQuantity += prodItem.soldQuantity;
            investorsMap[sponsor].totalRevenue = (0, money_util_1.roundMoney)(investorsMap[sponsor].totalRevenue + prodItem.totalRevenue);
            investorsMap[sponsor].totalToRepay = (0, money_util_1.roundMoney)(investorsMap[sponsor].totalToRepay + prodItem.costToRepay);
            investorsMap[sponsor].totalProfitForRetreat = (0, money_util_1.roundMoney)(investorsMap[sponsor].totalProfitForRetreat + prodItem.totalProfit);
        });
        const investorsReport = Object.values(investorsMap).map((inv) => {
            inv.repaymentProgress = inv.totalInvested > 0
                ? Math.min(100, Math.round((inv.totalToRepay / inv.totalInvested) * 100))
                : (inv.totalSoldQuantity > 0 ? 100 : 0);
            return inv;
        });
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
                    purchasesCount: 0,
                };
            }
            buyerStats[custId].totalSpent = (0, money_util_1.roundMoney)(buyerStats[custId].totalSpent + sale.totalPrice);
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
            hourlyRevenue[hourStr] = (0, money_util_1.roundMoney)((hourlyRevenue[hourStr] || 0) + sale.totalPrice);
        });
        const salesTimeline = Object.entries(hourlyRevenue)
            .map(([time, amount]) => ({ time, amount: (0, money_util_1.roundMoney)(amount) }))
            .sort((a, b) => a.time.localeCompare(b.time));
        return {
            summary: {
                totalRevenue,
                totalCost,
                totalProfit,
                profitMargin,
                pendingRevenue,
                totalSalesCount,
                pagoCount,
                pendenteCount,
                ticketMedio,
            },
            topSellingProducts,
            investorsReport,
            topBuyers,
            salesTimeline,
        };
    }
};
exports.SalesAnalyticsService = SalesAnalyticsService;
exports.SalesAnalyticsService = SalesAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SalesAnalyticsService);
//# sourceMappingURL=sales-analytics.service.js.map