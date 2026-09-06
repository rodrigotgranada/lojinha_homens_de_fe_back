import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
import { roundMoney } from "../common/utils/money.util";

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
          ticketMedio: 0,
        },
        topSellingProducts: [],
        topBuyers: [],
        salesTimeline: [],
      };
    }

    const saleEventId = new Types.ObjectId(eventId);

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

    // 1. Calculate Summary KPIs
    const totalRevenue = roundMoney(
      sales
        .filter((s) => s.status === "PAGO")
        .reduce((acc, s) => acc + s.totalPrice, 0)
    );

    const pendingRevenue = roundMoney(
      sales
        .filter((s) => s.status === "PENDENTE")
        .reduce((acc, s) => acc + s.totalPrice, 0)
    );

    // Total Cost (CPV) for paid sales
    const totalCost = roundMoney(
      sales
        .filter((s) => s.status === "PAGO")
        .reduce((acc, s) => {
          const saleCost = s.items.reduce((sum, item) => {
            const prodObj = item.productId as any;
            const currentProdCost = prodObj?.costPrice ?? 0;
            const itemCost =
              item.costAtPurchase && item.costAtPurchase > 0
                ? item.costAtPurchase
                : currentProdCost;
            return sum + item.quantity * itemCost;
          }, 0);
          return acc + saleCost;
        }, 0)
    );

    const totalProfit = roundMoney(totalRevenue - totalCost);
    const profitMargin =
      totalRevenue > 0 ? roundMoney((totalProfit / totalRevenue) * 100) : 0;

    const totalSalesCount = sales.length;
    const pagoCount = sales.filter((s) => s.status === "PAGO").length;
    const pendenteCount = sales.filter((s) => s.status === "PENDENTE").length;

    // Average Ticket
    const ticketMedio =
      totalSalesCount > 0
        ? roundMoney((totalRevenue + pendingRevenue) / totalSalesCount)
        : 0;

    // 2. Calculate Top Selling Products
    const productStats: Record<
      string,
      {
        name: string;
        quantity: number;
        revenue: number;
        cost: number;
        profit: number;
        category: string;
        sponsorName: string;
      }
    > = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prod = item.productId as any;
        if (!prod) return;

        const prodId = prod._id?.toString() || "unknown";
        const prodName = prod.name || "Produto Removido";
        const categoryName = prod.categoryRef?.name || "Outros";
        const sponsorName = prod.sponsorName || "Retiro / Sem Patrocinador";
        const currentProdCost = prod.costPrice ?? 0;
        const itemCost =
          item.costAtPurchase && item.costAtPurchase > 0
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

        const itemRev = roundMoney(item.quantity * item.priceAtPurchase);
        const itemTotalCost = roundMoney(item.quantity * itemCost);

        productStats[prodId].quantity += item.quantity;
        productStats[prodId].revenue = roundMoney(productStats[prodId].revenue + itemRev);
        productStats[prodId].cost = roundMoney(productStats[prodId].cost + itemTotalCost);
        productStats[prodId].profit = roundMoney(
          productStats[prodId].profit + (itemRev - itemTotalCost)
        );
      });
    });

    const topSellingProducts = Object.values(productStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // 3. Calculate Investors / Sponsors Accountability Report (Prestação de Contas)
    const allProducts = await this.productModel
      .find({
        active: { $ne: false },
        $or: [{ eventId: saleEventId }, { eventId: null }, { eventId: { $exists: false } }],
      })
      .exec();

    const investorMap: Record<
      string,
      {
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
          costToRepay: number;
          totalProfit: number;
          investedAmount: number;
        }>;
        totalInvested: number;
        totalSoldQuantity: number;
        totalRevenue: number;
        totalToRepay: number;
        totalProfitForRetreat: number;
        repaymentProgress: number;
      }
    > = {};

    allProducts.forEach((prod) => {
      const sponsor = (prod.sponsorName || "").trim();
      if (!sponsor) return;

      if (!investorMap[sponsor]) {
        investorMap[sponsor] = {
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

      const prodId = prod._id.toString();
      const stat = productStats[prodId];
      const soldQty = stat ? stat.quantity : 0;
      const totalRev = stat ? stat.revenue : 0;

      const costPrice = prod.costPrice || 0;
      const salePrice = prod.price || 0;
      const currentStock = prod.stock ?? 0;
      const initialStock =
        prod.initialStock && prod.initialStock > 0
          ? prod.initialStock
          : currentStock + soldQty;
      const investedAmount = roundMoney(initialStock * costPrice);
      const costToRepay = roundMoney(soldQty * costPrice);
      const prodProfit = roundMoney(totalRev - costToRepay);

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
        investedAmount,
      });

      investorMap[sponsor].totalInvested = roundMoney(
        investorMap[sponsor].totalInvested + investedAmount
      );
      investorMap[sponsor].totalSoldQuantity += soldQty;
      investorMap[sponsor].totalRevenue = roundMoney(
        investorMap[sponsor].totalRevenue + totalRev
      );
      investorMap[sponsor].totalToRepay = roundMoney(
        investorMap[sponsor].totalToRepay + costToRepay
      );
      investorMap[sponsor].totalProfitForRetreat = roundMoney(
        investorMap[sponsor].totalProfitForRetreat + prodProfit
      );
    });

    const investorsReport = Object.values(investorMap).map((inv) => {
      const progress =
        inv.totalInvested > 0
          ? Math.min(100, Math.round((inv.totalToRepay / inv.totalInvested) * 100))
          : 0;
      return {
        ...inv,
        repaymentProgress: progress,
      };
    });

    // 4. Calculate Top Buyers
    const buyerStats: Record<
      string,
      { name: string; totalSpent: number; cpf: string; purchasesCount: number }
    > = {};

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
          purchasesCount: 0,
        };
      }

      buyerStats[custId].totalSpent = roundMoney(
        buyerStats[custId].totalSpent + sale.totalPrice
      );
      buyerStats[custId].purchasesCount += 1;
    });

    const topBuyers = Object.values(buyerStats)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // 5. Calculate Sales Timeline
    const hourlyRevenue: Record<string, number> = {};

    sales.forEach((sale) => {
      const saleAny = sale as any;
      if (!saleAny.createdAt) return;
      const date = new Date(saleAny.createdAt);
      const hourStr = `${date.getHours().toString().padStart(2, "0")}:00`;
      hourlyRevenue[hourStr] = roundMoney((hourlyRevenue[hourStr] || 0) + sale.totalPrice);
    });

    const salesTimeline = Object.entries(hourlyRevenue)
      .map(([time, amount]) => ({ time, amount: roundMoney(amount) }))
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
}
