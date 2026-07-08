import { SalesAnalyticsService } from "./sales-analytics.service";
export declare class SalesAnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: SalesAnalyticsService);
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
