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
        const totalCost = sales
            .filter((s) => s.status === "PAGO")
            .reduce((acc, s) => {
            const saleCost = s.items.reduce((sum, item) => {
                const prodObj = item.productId;
                const currentProdCost = prodObj?.costPrice ?? 0;
                const itemCost = (item.costAtPurchase && item.costAtPurchase > 0) ? item.costAtPurchase : currentProdCost;
                return sum + (item.quantity * itemCost);
            }, 0);
            return acc + saleCost;
        }, 0);
        const totalProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
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
                const sponsorName = prod.sponsorName || "Retiro / Sem Patrocinador";
                const currentProdCost = prod.costPrice ?? 0;
                const itemCost = (item.costAtPurchase && item.costAtPurchase > 0) ? item.costAtPurchase : currentProdCost;
                if (!productStats[prodId]) {
                    productStats[prodId] = {
                        name: prodName,
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                        category: categoryName,
                        sponsorName
                    };
                }
                const itemRev = item.quantity * item.priceAtPurchase;
                const itemTotalCost = item.quantity * itemCost;
                productStats[prodId].quantity += item.quantity;
                productStats[prodId].revenue += itemRev;
                productStats[prodId].cost += itemTotalCost;
                productStats[prodId].profit += (itemRev - itemTotalCost);
            });
        });
        const topSellingProducts = Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        const allProducts = await this.productModel.find({ active: { $ne: false } }).exec();
        const investorMap = {};
        allProducts.forEach((prod) => {
            const sponsor = (prod.sponsorName || "").trim();
            if (!sponsor)
                return;
            if (!investorMap[sponsor]) {
                investorMap[sponsor] = {
                    sponsorName: sponsor,
                    products: [],
                    totalInvested: 0,
                    totalSoldQuantity: 0,
                    totalRevenue: 0,
                    totalToRepay: 0,
                    totalProfitForRetreat: 0,
                    repaymentProgress: 0
                };
            }
            const prodId = prod._id.toString();
            const stat = productStats[prodId];
            const soldQty = stat ? stat.quantity : 0;
            const totalRev = stat ? stat.revenue : 0;
            const costPrice = prod.costPrice || 0;
            const salePrice = prod.price || 0;
            const currentStock = prod.stock ?? 0;
            const initialStock = prod.initialStock && prod.initialStock > 0 ? prod.initialStock : (currentStock + soldQty);
            const investedAmount = initialStock * costPrice;
            const costToRepay = soldQty * costPrice;
            const prodProfit = totalRev - costToRepay;
            investorMap[sponsor].products.push({
                productId: prodId,
                name: prod.name,
                costPrice,
                salePrice,
                initialStock,
                currentStock,
                soldQuantity: soldQty,
                totalRevenue: totalRev,
                costToRepay,
                totalProfit: prodProfit,
                investedAmount
            });
            investorMap[sponsor].totalInvested += investedAmount;
            investorMap[sponsor].totalSoldQuantity += soldQty;
            investorMap[sponsor].totalRevenue += totalRev;
            investorMap[sponsor].totalToRepay += costToRepay;
            investorMap[sponsor].totalProfitForRetreat += prodProfit;
        });
        Object.entries(productStats).forEach(([prodId, stat]) => {
            const sponsor = (stat.sponsorName || "").trim();
            if (!sponsor || sponsor === "Retiro / Sem Patrocinador")
                return;
            const alreadyAdded = investorMap[sponsor]?.products.some(p => p.productId === prodId);
            if (!alreadyAdded) {
                if (!investorMap[sponsor]) {
                    investorMap[sponsor] = {
                        sponsorName: sponsor,
                        products: [],
                        totalInvested: 0,
                        totalSoldQuantity: 0,
                        totalRevenue: 0,
                        totalToRepay: 0,
                        totalProfitForRetreat: 0,
                        repaymentProgress: 0
                    };
                }
                const costPrice = stat.quantity > 0 ? stat.cost / stat.quantity : 0;
                const salePrice = stat.quantity > 0 ? stat.revenue / stat.quantity : 0;
                const initialStock = stat.quantity;
                const currentStock = 0;
                const investedAmount = initialStock * costPrice;
                const costToRepay = stat.quantity * costPrice;
                const prodProfit = stat.revenue - costToRepay;
                investorMap[sponsor].products.push({
                    productId: prodId,
                    name: stat.name,
                    costPrice,
                    salePrice,
                    initialStock,
                    currentStock,
                    soldQuantity: stat.quantity,
                    totalRevenue: stat.revenue,
                    costToRepay,
                    totalProfit: prodProfit,
                    investedAmount
                });
                investorMap[sponsor].totalInvested += investedAmount;
                investorMap[sponsor].totalSoldQuantity += stat.quantity;
                investorMap[sponsor].totalRevenue += stat.revenue;
                investorMap[sponsor].totalToRepay += costToRepay;
                investorMap[sponsor].totalProfitForRetreat += prodProfit;
            }
        });
        const investorsReport = Object.values(investorMap).map(inv => {
            const progress = inv.totalInvested > 0 ? Math.min(100, Math.round((inv.totalToRepay / inv.totalInvested) * 100)) : 0;
            return {
                ...inv,
                repaymentProgress: progress
            };
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
                totalCost,
                totalProfit,
                profitMargin,
                pendingRevenue,
                totalSalesCount,
                pagoCount,
                pendenteCount,
                ticketMedio
            },
            topSellingProducts,
            investorsReport,
            topBuyers,
            salesTimeline
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