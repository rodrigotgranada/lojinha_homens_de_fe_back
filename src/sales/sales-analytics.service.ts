import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";

@Injectable()
export class SalesAnalyticsService {
  constructor(
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>
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

    // Total Cost (CPV) for paid sales
    const totalCost = sales
      .filter((s) => s.status === "PAGO")
      .reduce((acc, s) => {
        const saleCost = s.items.reduce((sum, item) => {
          const prodObj = item.productId as any;
          const currentProdCost = prodObj?.costPrice ?? 0;
          // Use stored costAtPurchase if positive, otherwise fallback to product's current costPrice
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

    // Average Ticket
    const ticketMedio = totalSalesCount > 0 ? (totalRevenue + pendingRevenue) / totalSalesCount : 0;

    // 2. Calculate Top Selling Products
    const productStats: Record<string, { name: string; quantity: number; revenue: number; cost: number; profit: number; category: string; sponsorName: string }> = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prod = item.productId as any;
        if (!prod) return;

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

    // 3. Calculate Investors / Sponsors Accountability Report (Prestação de Contas)
    // Fetch all active products in the system to include sponsored products even before any sales occur
    const allProducts = await this.productModel.find({ active: { $ne: false } }).exec();

    const investorMap: Record<string, {
      sponsorName: string;
      products: Array<{
        productId: string;
        name: string;
        costPrice: number;
        salePrice: number;
        initialStock: number;
        currentStock: number;
        soldQuantity: number;
        totalRevenue: number;
        costToRepay: number; // Qtd vendida * Custo
        totalProfit: number;
        investedAmount: number; // Qtd inicial * Custo
      }>;
      totalInvested: number;
      totalSoldQuantity: number;
      totalRevenue: number;
      totalToRepay: number; // Capital a devolver
      totalProfitForRetreat: number; // Lucro pro retiro
      repaymentProgress: number; // % do investimento já recuperado
    }> = {};

    // First, process all products that have an assigned sponsor
    allProducts.forEach((prod) => {
      const sponsor = (prod.sponsorName || "").trim();
      if (!sponsor) return; // Skip items without a sponsor for this specific report

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

    // Also include any sold products that might have had sponsorName from sales not found in active products
    Object.entries(productStats).forEach(([prodId, stat]) => {
      const sponsor = (stat.sponsorName || "").trim();
      if (!sponsor || sponsor === "Retiro / Sem Patrocinador") return;

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

    // Calculate progress percentage for each sponsor
    const investorsReport = Object.values(investorMap).map(inv => {
      const progress = inv.totalInvested > 0 ? Math.min(100, Math.round((inv.totalToRepay / inv.totalInvested) * 100)) : 0;
      return {
        ...inv,
        repaymentProgress: progress
      };
    });

    // 4. Calculate Top Buyers
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

    // 5. Calculate Sales Timeline (grouped by hour)
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
}
