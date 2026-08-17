import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Expense, ExpenseItem } from "../schemas/expense.schema";
import { EventIncome } from "../schemas/event-income.schema";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
import { LogsService } from "../logs/logs.service";

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    @InjectModel(EventIncome.name) private readonly eventIncomeModel: Model<EventIncome>,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    private readonly logsService: LogsService
  ) {}

  // Listar todas as despesas/obras de um evento
  async findAll(eventId: string): Promise<Expense[]> {
    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return this.expenseModel.find().sort({ createdAt: -1 }).exec();
    }
    return this.expenseModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Criar um novo centro de custo/obra
  async create(createDto: {
    eventId: string;
    title: string;
    category?: string;
    nature?: "INFRAESTRUTURA" | "OPERACIONAL";
    description?: string;
    operatorName?: string;
  }): Promise<Expense> {
    const expense = new this.expenseModel({
      eventId: new Types.ObjectId(createDto.eventId),
      title: createDto.title,
      category: createDto.category || "OBRA",
      nature: createDto.nature || (createDto.category === "OBRA" || createDto.category === "LOCACAO" || createDto.category === "ESTRUTURA" ? "INFRAESTRUTURA" : "OPERACIONAL"),
      description: createDto.description || "",
      items: [],
      totalAmount: 0,
      totalRepaid: 0,
    });

    const saved = await expense.save();

    await this.logsService.create({
      userId: "system",
      userName: createDto.operatorName || "Admin",
      action: "expense_group_create",
      description: `Criou o grupo de despesas/obra "${createDto.title}" (${expense.nature})`,
      metadata: { expenseId: saved.id, eventId: createDto.eventId },
    });

    return saved;
  }

  // Adicionar um item a um grupo de despesa
  async addItem(
    expenseId: string,
    itemDto: {
      description: string;
      amount: number;
      paidBy: string;
      payerPhone?: string;
      isDonation?: boolean;
      notes?: string;
      receiptUrl?: string;
      operatorName?: string;
    }
  ): Promise<Expense> {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) {
      throw new NotFoundException(`Despesa #${expenseId} não encontrada`);
    }

    const isDonation = Boolean(itemDto.isDonation);
    const amount = isDonation ? 0 : Number(itemDto.amount) || 0;
    const status = isDonation ? "DOACAO" : "PENDENTE";

    const newItem: ExpenseItem = {
      _id: new Types.ObjectId(),
      description: itemDto.description,
      amount,
      paidBy: itemDto.paidBy.trim(),
      payerPhone: itemDto.payerPhone || "",
      isDonation,
      status,
      repaidAmount: 0,
      notes: itemDto.notes || "",
      receiptUrl: itemDto.receiptUrl || "",
      date: new Date(),
    };

    expense.items.push(newItem);
    this.recalculateTotals(expense);
    const saved = await expense.save();

    await this.logsService.create({
      userId: "system",
      userName: itemDto.operatorName || "Admin",
      action: "expense_item_add",
      description: `Adicionou o item "${itemDto.description}" (${isDonation ? "Doação" : "R$ " + amount.toFixed(2)}) pago/doado por ${itemDto.paidBy} na obra "${expense.title}"`,
      metadata: { expenseId, item: newItem },
    });

    return saved;
  }

  // Atualizar um item existente ou registrar reembolso
  async updateItem(
    expenseId: string,
    itemId: string,
    updateDto: {
      description?: string;
      amount?: number;
      paidBy?: string;
      payerPhone?: string;
      isDonation?: boolean;
      status?: "PENDENTE" | "REEMBOLSADO_PARCIAL" | "REEMBOLSADO" | "DOACAO";
      repaidAmount?: number;
      notes?: string;
      receiptUrl?: string;
      operatorName?: string;
    }
  ): Promise<Expense> {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) {
      throw new NotFoundException(`Despesa #${expenseId} não encontrada`);
    }

    const item = expense.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      throw new NotFoundException(`Item #${itemId} não encontrado na despesa`);
    }

    if (updateDto.description !== undefined) item.description = updateDto.description;
    if (updateDto.paidBy !== undefined) item.paidBy = updateDto.paidBy.trim();
    if (updateDto.payerPhone !== undefined) item.payerPhone = updateDto.payerPhone;
    if (updateDto.notes !== undefined) item.notes = updateDto.notes;
    if (updateDto.receiptUrl !== undefined) item.receiptUrl = updateDto.receiptUrl;

    if (updateDto.isDonation !== undefined) {
      item.isDonation = updateDto.isDonation;
      if (item.isDonation) {
        item.amount = 0;
        item.status = "DOACAO";
        item.repaidAmount = 0;
      }
    }

    if (!item.isDonation && updateDto.amount !== undefined) {
      item.amount = Number(updateDto.amount) || 0;
    }

    if (!item.isDonation && updateDto.repaidAmount !== undefined) {
      item.repaidAmount = Number(updateDto.repaidAmount) || 0;
      if (item.repaidAmount >= item.amount) {
        item.status = "REEMBOLSADO";
      } else if (item.repaidAmount > 0) {
        item.status = "REEMBOLSADO_PARCIAL";
      } else {
        item.status = "PENDENTE";
      }
    } else if (updateDto.status !== undefined && !item.isDonation) {
      item.status = updateDto.status;
      if (item.status === "REEMBOLSADO") {
        item.repaidAmount = item.amount;
      } else if (item.status === "PENDENTE") {
        item.repaidAmount = 0;
      }
    }

    this.recalculateTotals(expense);
    const saved = await expense.save();

    await this.logsService.create({
      userId: "system",
      userName: updateDto.operatorName || "Admin",
      action: "expense_item_update",
      description: `Atualizou o item "${item.description}" na obra "${expense.title}" (Status: ${item.status}, Devolvido: R$ ${item.repaidAmount.toFixed(2)})`,
      metadata: { expenseId, itemId, item },
    });

    return saved;
  }

  // Deletar um item
  async deleteItem(expenseId: string, itemId: string, operatorName?: string): Promise<Expense> {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) {
      throw new NotFoundException(`Despesa #${expenseId} não encontrada`);
    }

    expense.items = expense.items.filter((i) => i._id.toString() !== itemId);
    this.recalculateTotals(expense);
    const saved = await expense.save();

    await this.logsService.create({
      userId: "system",
      userName: operatorName || "Admin",
      action: "expense_item_delete",
      description: `Removeu um item da obra/despesa "${expense.title}"`,
      metadata: { expenseId, itemId },
    });

    return saved;
  }

  // Deletar grupo de despesa
  async delete(expenseId: string, operatorName?: string): Promise<void> {
    const expense = await this.expenseModel.findByIdAndDelete(expenseId).exec();
    if (expense) {
      await this.logsService.create({
        userId: "system",
        userName: operatorName || "Admin",
        action: "expense_group_delete",
        description: `Excluiu o grupo de despesas "${expense.title}"`,
        metadata: { expenseId },
      });
    }
  }

  private recalculateTotals(expense: Expense) {
    let total = 0;
    let repaid = 0;
    for (const item of expense.items) {
      if (!item.isDonation) {
        total += item.amount || 0;
        repaid += item.repaidAmount || 0;
      }
    }
    expense.totalAmount = total;
    expense.totalRepaid = repaid;
  }

  // ==========================================
  // RECEITAS EXTRAS DO EVENTO (Inscrições, Rifas, Jantas)
  // ==========================================
  async findIncomes(eventId: string): Promise<EventIncome[]> {
    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return this.eventIncomeModel.find().sort({ date: -1 }).exec();
    }
    return this.eventIncomeModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ date: -1 })
      .exec();
  }

  async createIncome(incomeDto: {
    eventId: string;
    title: string;
    type: string;
    amount: number;
    notes?: string;
    operatorName?: string;
  }): Promise<EventIncome> {
    const income = new this.eventIncomeModel({
      eventId: new Types.ObjectId(incomeDto.eventId),
      title: incomeDto.title,
      type: incomeDto.type,
      amount: Number(incomeDto.amount) || 0,
      notes: incomeDto.notes || "",
      date: new Date(),
    });

    const saved = await income.save();

    await this.logsService.create({
      userId: "system",
      userName: incomeDto.operatorName || "Admin",
      action: "event_income_create",
      description: `Registrou entrada de receita "${incomeDto.title}" no valor de R$ ${Number(incomeDto.amount).toFixed(2)} (${incomeDto.type})`,
      metadata: { incomeId: saved.id, eventId: incomeDto.eventId },
    });

    return saved;
  }

  async deleteIncome(id: string, operatorName?: string): Promise<void> {
    const income = await this.eventIncomeModel.findByIdAndDelete(id).exec();
    if (income) {
      await this.logsService.create({
        userId: "system",
        userName: operatorName || "Admin",
        action: "event_income_delete",
        description: `Removeu entrada de receita "${income.title}" no valor de R$ ${income.amount.toFixed(2)}`,
        metadata: { id },
      });
    }
  }

  // ==========================================
  // BALANÇO CONSOLIDADO DO EVENTO (DESPESAS + RECEITAS + REEMBOLSOS)
  // ==========================================
  async getEventFinancialSummary(eventId: string) {
    const objEventId = Types.ObjectId.isValid(eventId) ? new Types.ObjectId(eventId) : null;

    // 1. Buscar despesas do evento
    const expenses = await this.expenseModel.find({
      ...(objEventId ? { eventId: objEventId } : {}),
    }).exec();

    // 2. Buscar receitas extras do evento
    const incomes = await this.eventIncomeModel.find({
      ...(objEventId ? { eventId: objEventId } : {}),
    }).exec();

    // 3. Buscar vendas pagas da lojinha
    const sales = await this.saleModel.find({
      ...(objEventId ? { $or: [{ eventId: objEventId }, { eventId }] } : {}),
      status: "PAGO",
    }).populate("items.productId").exec();

    const lojinhaRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
    const lojinhaCost = sales.reduce((acc, s) => {
      return acc + s.items.reduce((sum, item) => {
        const prodObj = item.productId as any;
        const currentProdCost = prodObj?.costPrice ?? 0;
        const cost = (item.costAtPurchase && item.costAtPurchase > 0) ? item.costAtPurchase : currentProdCost;
        return sum + (item.quantity * cost);
      }, 0);
    }, 0);
    const lojinhaProfit = lojinhaRevenue - lojinhaCost;

    // Totais de despesas
    let totalExpensesAmount = 0;
    let totalExpensesRepaid = 0;
    let totalDonatedItemsCount = 0;
    let totalInfraExpenses = 0;
    let totalOperExpenses = 0;

    // Extrato por Irmão / Financiador
    const payerMap: Record<string, {
      payerName: string;
      payerPhone: string;
      items: Array<{
        expenseTitle: string;
        description: string;
        amount: number;
        repaidAmount: number;
        status: string;
        isDonation: boolean;
        nature: string;
      }>;
      totalPaid: number;
      totalRepaid: number;
      balanceToRepay: number; // totalPaid - totalRepaid
      isFullyRepaid: boolean;
      donationsCount: number;
    }> = {};

    // Por Categoria
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.totalAmount;

      const isInfra = exp.nature === "INFRAESTRUTURA" || exp.category === "OBRA" || exp.category === "LOCACAO" || exp.category === "ESTRUTURA";
      if (isInfra) {
        totalInfraExpenses += exp.totalAmount;
      } else {
        totalOperExpenses += exp.totalAmount;
      }

      exp.items.forEach((item) => {
        if (item.isDonation) {
          totalDonatedItemsCount += 1;
        } else {
          totalExpensesAmount += item.amount;
          totalExpensesRepaid += item.repaidAmount;
        }

        const payer = item.paidBy || "Anônimo";
        if (!payerMap[payer]) {
          payerMap[payer] = {
            payerName: payer,
            payerPhone: item.payerPhone || "",
            items: [],
            totalPaid: 0,
            totalRepaid: 0,
            balanceToRepay: 0,
            isFullyRepaid: false,
            donationsCount: 0,
          };
        }

        payerMap[payer].items.push({
          expenseTitle: exp.title,
          description: item.description,
          amount: item.amount,
          repaidAmount: item.repaidAmount,
          status: item.status,
          isDonation: item.isDonation,
          nature: exp.nature || (isInfra ? "INFRAESTRUTURA" : "OPERACIONAL"),
        });

        if (item.isDonation) {
          payerMap[payer].donationsCount += 1;
        } else {
          payerMap[payer].totalPaid += item.amount;
          payerMap[payer].totalRepaid += item.repaidAmount;
        }
      });
    });

    // 4. Buscar produtos da Lojinha com Investidores/Patrocinadores vinculados
    const allProducts = await this.productModel.find({ active: { $ne: false } }).exec();

    let totalStoreInvestment = 0;
    let totalStoreRepaid = 0;

    allProducts.forEach((prod) => {
      const sponsor = (prod.sponsorName || "").trim();
      if (!sponsor) return;

      const prodCost = prod.costPrice || 0;
      const initialStock = prod.initialStock && prod.initialStock > 0 ? prod.initialStock : prod.stock;
      const investedAmount = initialStock * prodCost;

      // Calcular quantas unidades desse produto já foram vendidas
      const soldQty = sales.reduce((acc, s) => {
        return acc + s.items.reduce((sum, it) => {
          const itId = (it.productId as any)?._id?.toString() || it.productId?.toString();
          return itId === prod._id.toString() ? sum + it.quantity : sum;
        }, 0);
      }, 0);

      const costToRepay = soldQty * prodCost; // Valor já liberado para devolver com as vendas

      totalStoreInvestment += investedAmount;
      totalStoreRepaid += costToRepay;

      // Adicionar o patrocinador no extrato geral de quem colocou dinheiro
      if (!payerMap[sponsor]) {
        payerMap[sponsor] = {
          payerName: sponsor,
          payerPhone: (prod as any).sponsorCpf || "Investidor Lojinha",
          items: [],
          totalPaid: 0,
          totalRepaid: 0,
          balanceToRepay: 0,
          isFullyRepaid: false,
          donationsCount: 0,
        };
      }

      payerMap[sponsor].items.push({
        expenseTitle: `Confecção Lojinha (${prod.name})`,
        description: `Tiragem de ${initialStock} unids a R$ ${prodCost.toFixed(2)} (${soldQty} vendidas)`,
        amount: investedAmount,
        repaidAmount: costToRepay,
        status: costToRepay >= investedAmount ? "REEMBOLSADO" : costToRepay > 0 ? "REEMBOLSADO_PARCIAL" : "PENDENTE",
        isDonation: false,
        nature: "LOJINHA_INVESTIMENTO",
      });

      payerMap[sponsor].totalPaid += investedAmount;
      payerMap[sponsor].totalRepaid += costToRepay;
    });

    const payersReport = Object.values(payerMap).map((p) => {
      const balance = Math.max(0, p.totalPaid - p.totalRepaid);
      return {
        ...p,
        balanceToRepay: balance,
        isFullyRepaid: p.totalPaid > 0 && balance === 0,
      };
    });

    // Totais de Receitas Extras
    const totalExtraIncomes = incomes.reduce((acc, inc) => acc + inc.amount, 0);

    // Total de Arrecadação Global do Evento (Receitas Extras + Lucro Líquido da Lojinha)
    const totalAvailableEventFunds = totalExtraIncomes + lojinhaProfit;

    // Saldo Final do Retiro após quitar despesas
    const finalEventBalance = totalAvailableEventFunds - totalExpensesAmount;

    return {
      summary: {
        totalExpensesAmount,
        totalInfraExpenses,
        totalOperExpenses,
        totalExpensesRepaid,
        totalExpensesPendingRepay: totalExpensesAmount - totalExpensesRepaid,
        totalDonatedItemsCount,
        totalStoreInvestment,
        totalStoreRepaid,
        totalStorePendingRepay: totalStoreInvestment - totalStoreRepaid,
        totalExtraIncomes,
        lojinhaRevenue,
        lojinhaCost,
        lojinhaProfit,
        totalAvailableEventFunds,
        finalEventBalance,
      },
      categoryTotals,
      payersReport,
      expenses,
      incomes,
    };
  }
}
