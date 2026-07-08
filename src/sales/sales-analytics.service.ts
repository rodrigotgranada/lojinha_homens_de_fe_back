import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Sale } from "../schemas/sale.schema";

@Injectable()
export class SalesAnalyticsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>
  ) {}

  async getEventAnalytics(eventId: string) {
    if (!eventId || !Types.ObjectId.isValid(eventId)) {
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

    const saleEventId = new Types.ObjectId(eventId);

    console.log(`[SalesAnalyticsService] Querying sales for eventId: "${eventId}" (ObjectId: ${saleEventId.toString()})`);

    // Fetch all sales for the event that are not canceled (supporting both String and ObjectId stored eventId fields)
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

    // 1. Calculate Summary KPIs
    // Total Revenue (only paid sales contribute to current revenue)
    const totalRevenue = sales
      .filter((s) => s.status === "PAGO")
      .reduce((acc, s) => acc + s.totalPrice, 0);

    const pendingRevenue = sales
      .filter((s) => s.status === "PENDENTE")
      .reduce((acc, s) => acc + s.totalPrice, 0);

    const totalSalesCount = sales.length;
    const pagoCount = sales.filter((s) => s.status === "PAGO").length;
    const pendenteCount = sales.filter((s) => s.status === "PENDENTE").length;

    // Average Ticket
    const ticketMedio = totalSalesCount > 0 ? (totalRevenue + pendingRevenue) / totalSalesCount : 0;

    // 2. Calculate Top Selling Products
    const productStats: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prod = item.productId as any;
        if (!prod) return;

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

    // 3. Calculate Top Buyers
    const buyerStats: Record<string, { name: string; totalSpent: number; cpf: string; purchasesCount: number }> = {};

    sales.forEach((sale) => {
      const customer = sale.customerId as any;
      if (!customer) return;

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

    // 4. Calculate Sales Timeline (grouped by hour)
    const hourlyRevenue: Record<string, number> = {};

    sales.forEach((sale) => {
      const saleAny = sale as any;
      if (!saleAny.createdAt) return;
      const date = new Date(saleAny.createdAt);
      // Format as "HH:00"
      const hourStr = `${date.getHours().toString().padStart(2, "0")}:00`;
      
      hourlyRevenue[hourStr] = (hourlyRevenue[hourStr] || 0) + sale.totalPrice;
    });

    // Sort hours chronologically
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
}
