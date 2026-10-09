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
