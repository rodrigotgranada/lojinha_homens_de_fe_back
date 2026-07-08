import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
export declare class SalesAnalyticsService {
    private readonly saleModel;
    constructor(saleModel: Model<Sale>);
    getEventAnalytics(eventId: string): Promise<{
        summary: {
            totalRevenue: number;
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
            category: string;
        }[];
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
