import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
export declare class SalesAnalyticsService {
    private readonly saleModel;
    private readonly productModel;
    constructor(saleModel: Model<Sale>, productModel: Model<Product>);
    getEventAnalytics(eventId: string): Promise<{
        summary: {
            totalRevenue: number;
            pendingRevenue: number;
            totalSalesCount: number;
            pagoCount: number;
            pendenteCount: number;
            ticketMedio: number;
            totalCost?: undefined;
            totalProfit?: undefined;
            profitMargin?: undefined;
        };
        topSellingProducts: never[];
        topBuyers: never[];
        salesTimeline: never[];
        investorsReport?: undefined;
    } | {
        summary: {
            totalRevenue: number;
            totalCost: number;
            totalProfit: number;
            profitMargin: number;
            pendingRevenue: number;
            totalSalesCount: number;
            pagoCount: number;
            pendenteCount: number;
            ticketMedio: number;
        };
        topSellingProducts: {
            name: string;
            quantity: number;
            revenue: number;
            cost: number;
            profit: number;
            category: string;
            sponsorName: string;
        }[];
        investorsReport: any[];
        topBuyers: {
            name: string;
            totalSpent: number;
            cpf: string;
            purchasesCount: number;
        }[];
        salesTimeline: {
            time: string;
            amount: number;
        }[];
    }>;
}
