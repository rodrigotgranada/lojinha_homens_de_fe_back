import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Expense, ExpenseItem, RepaymentRecord } from "../schemas/expense.schema";
import { EventIncome } from "../schemas/event-income.schema";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
import { LogsService } from "../logs/logs.service";
import { roundMoney } from "../common/utils/money.util";
import { CreateExpenseGroupDto } from "./dto/create-expense-group.dto";
import { CreateExpenseItemDto, UpdateExpenseItemDto } from "./dto/create-expense-item.dto";
import { AddRepaymentDto } from "./dto/add-repayment.dto";
import { CreateIncomeDto } from "./dto/create-income.dto";

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
  async create(createDto: CreateExpenseGroupDto): Promise<Expense> {
    const category = createDto.category || "OBRA";
    const nature =
      createDto.nature ||
      (category === "OBRA" || category === "LOCACAO" || category === "ESTRUTURA"
        ? "INFRAESTRUTURA"
        : "OPERACIONAL");

    const expense = new this.expenseModel({
      eventId: new Types.ObjectId(createDto.eventId),
      title: createDto.title,
      category,
      nature,
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
    itemDto: CreateExpenseItemDto
  ): Promise<Expense> {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) {
      throw new NotFoundException(`Despesa #${expenseId} não encontrada`);
    }

    const isDonation = Boolean(itemDto.isDonation);
    const amount = isDonation ? 0 : roundMoney(Number(itemDto.amount) || 0);
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
      repaymentHistory: [],
    };

    expense.items.push(newItem);
    this.recalculateTotals(expense);
    const saved = await expense.save();

    await this.logsService.create({
      userId: "system",
      userName: itemDto.operatorName || "Admin",
      action: "expense_item_add",
      description: `Adicionou o item "${itemDto.description}" (${
        isDonation ? "Doação" : "R$ " + amount.toFixed(2)
      }) pago/doado por ${itemDto.paidBy} na obra "${expense.title}"`,
      metadata: { expenseId, item: newItem },
    });

    return saved;
  }

  // Registrar parcela individual de reembolso com histórico e trava de sobre-reembolso
  async addRepayment(
    expenseId: string,
    itemId: string,
    dto: AddRepaymentDto
  ): Promise<Expense> {
    const expense = await this.expenseModel.findById(expenseId).exec();
    if (!expense) {
      throw new NotFoundException(`Despesa #${expenseId} não encontrada`);
    }

    const item = expense.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      throw new NotFoundException(`Item #${itemId} não encontrado na despesa`);
    }

    if (item.isDonation) {
      throw new BadRequestException("Itens marcados como doação não recebem reembolso.");
    }

    const repayAmount = roundMoney(Number(dto.amount) || 0);
    if (repayAmount <= 0) {
      throw new BadRequestException("O valor do reembolso deve ser maior que zero.");
    }

    const currentRepaid = roundMoney(item.repaidAmount || 0);
    const newTotalRepaid = roundMoney(currentRepaid + repayAmount);

    // Trava de Sobre-reembolso: Não permitir devolver mais do que foi adiantado
    if (newTotalRepaid > item.amount) {
      const maxAllowed = roundMoney(item.amount - currentRepaid);
      throw new BadRequestException(
        `O valor informado (R$ ${repayAmount.toFixed(2)}) ultrapassa o saldo pendente de R$ ${maxAllowed.toFixed(2)} (Valor original: R$ ${item.amount.toFixed(2)}).`
      );
    }

    const repaymentRecord: RepaymentRecord = {
      _id: new Types.ObjectId(),
      amount: repayAmount,
      date: new Date(),
      method: dto.method || "PIX",
      proofUrl: dto.proofUrl || "",
      operatorName: dto.operatorName || "Admin",
      notes: dto.notes || "",
    };

    if (!item.repaymentHistory) {
      item.repaymentHistory = [];
    }
    item.repaymentHistory.push(repaymentRecord);
    item.repaidAmount = newTotalRepaid;

    if (item.repaidAmount >= item.amount) {
      item.status = "REEMBOLSADO";
    } else if (item.repaidAmount > 0) {
      item.status = "REEMBOLSADO_PARCIAL";
    } else {
      item.status = "PENDENTE";
    }

    this.recalculateTotals(expense);
    const saved = await expense.save();

    await this.logsService.create({
      userId: "system",
      userName: dto.operatorName || "Admin",
      action: "expense_item_repayment",
      description: `Registrou reembolso de R$ ${repayAmount.toFixed(2)} via ${repaymentRecord.method} para ${item.paidBy} no item "${item.description}" (${item.status})`,
      metadata: { expenseId, itemId, repaymentRecord },
    });

    return saved;
  }

  // Atualizar um item existente com validações e trava de sobre-reembolso
  async updateItem(
    expenseId: string,
    itemId: string,
    updateDto: UpdateExpenseItemDto
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
        item.repaymentHistory = [];
      }
    }

    if (!item.isDonation && updateDto.amount !== undefined) {
      item.amount = roundMoney(Number(updateDto.amount) || 0);
    }

    if (!item.isDonation && updateDto.repaidAmount !== undefined) {
      const requestedRepaid = roundMoney(Number(updateDto.repaidAmount) || 0);
      
      // Trava de Sobre-reembolso
      if (requestedRepaid > item.amount) {
        throw new BadRequestException(
          `O valor reembolsado (R$ ${requestedRepaid.toFixed(2)}) não pode ser superior ao valor da despesa (R$ ${item.amount.toFixed(2)}).`
        );
      }

      item.repaidAmount = requestedRepaid;
      if (item.repaidAmount >= item.amount && item.amount > 0) {
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
        total = roundMoney(total + (item.amount || 0));
        repaid = roundMoney(repaid + (item.repaidAmount || 0));
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

  async createIncome(incomeDto: CreateIncomeDto): Promise<EventIncome> {
    const income = new this.eventIncomeModel({
      eventId: new Types.ObjectId(incomeDto.eventId),
      title: incomeDto.title,
      type: incomeDto.type,
      amount: roundMoney(Number(incomeDto.amount) || 0),
      notes: incomeDto.notes || "",
      date: new Date(),
    });

    const saved = await income.save();

    await this.logsService.create({
      userId: "system",
      userName: incomeDto.operatorName || "Admin",
      action: "event_income_create",
      description: `Registrou entrada de receita "${incomeDto.title}" no valor de R$ ${saved.amount.toFixed(2)} (${incomeDto.type})`,
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
  // BALANÇO CONSOLIDADO DO EVENTO (DESPESAS + RECEITAS + REEMBOLSOS + DISPONIBILIDADE DE CAIXA)
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

    const lojinhaRevenue = roundMoney(sales.reduce((acc, s) => acc + s.totalPrice, 0));
    const lojinhaCost = roundMoney(
      sales.reduce((acc, s) => {
        return (
          acc +
          s.items.reduce((sum, item) => {
            const prodObj = item.productId as any;
            const currentProdCost = prodObj?.costPrice ?? 0;
            const cost =
              item.costAtPurchase && item.costAtPurchase > 0
                ? item.costAtPurchase
                : currentProdCost;
            return sum + item.quantity * cost;
          }, 0)
        );
      }, 0)
    );
    const lojinhaProfit = roundMoney(lojinhaRevenue - lojinhaCost);

    // Totais de despesas
    let totalExpensesAmount = 0;
    let totalExpensesRepaid = 0;
    let totalDonatedItemsCount = 0;
    let totalInfraExpenses = 0;
    let totalOperExpenses = 0;

    // Extrato por Irmão / Financiador
    const payerMap: Record<
      string,
      {
        payerName: string;
        payerPhone: string;
        items: Array<{
          expenseId: string;
          itemId: string;
          expenseTitle: string;
          description: string;
          amount: number;
          repaidAmount: number;
          status: string;
          isDonation: boolean;
          nature: string;
          repaymentHistory: RepaymentRecord[];
        }>;
        totalPaid: number;
        totalRepaid: number;
        balanceToRepay: number;
        isFullyRepaid: boolean;
        donationsCount: number;
      }
    > = {};

    // Por Categoria
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((exp) => {
      categoryTotals[exp.category] = roundMoney(
        (categoryTotals[exp.category] || 0) + exp.totalAmount
      );

      const isInfra =
        exp.nature === "INFRAESTRUTURA" ||
        exp.category === "OBRA" ||
        exp.category === "LOCACAO" ||
        exp.category === "ESTRUTURA";

      if (isInfra) {
        totalInfraExpenses = roundMoney(totalInfraExpenses + exp.totalAmount);
      } else {
        totalOperExpenses = roundMoney(totalOperExpenses + exp.totalAmount);
      }

      exp.items.forEach((item) => {
        if (item.isDonation) {
          totalDonatedItemsCount += 1;
        } else {
          totalExpensesAmount = roundMoney(totalExpensesAmount + item.amount);
          totalExpensesRepaid = roundMoney(totalExpensesRepaid + item.repaidAmount);
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
          expenseId: exp.id || (exp as any)._id?.toString(),
          itemId: item._id?.toString(),
          expenseTitle: exp.title,
          description: item.description,
          amount: roundMoney(item.amount),
          repaidAmount: roundMoney(item.repaidAmount),
          status: item.status,
          isDonation: item.isDonation,
          nature: exp.nature || (isInfra ? "INFRAESTRUTURA" : "OPERACIONAL"),
          repaymentHistory: item.repaymentHistory || [],
        });

        if (item.isDonation) {
          payerMap[payer].donationsCount += 1;
        } else {
          payerMap[payer].totalPaid = roundMoney(payerMap[payer].totalPaid + item.amount);
          payerMap[payer].totalRepaid = roundMoney(
            payerMap[payer].totalRepaid + item.repaidAmount
          );
        }
      });
    });

    // 4. Buscar produtos da Lojinha com Investidores/Patrocinadores vinculados
    const allProducts = await this.productModel
      .find({
        active: { $ne: false },
        ...(objEventId ? { $or: [{ eventId: objEventId }, { eventId: null }, { eventId: { $exists: false } }] } : {}),
      })
      .exec();

    let totalStoreInvestment = 0;
    let totalStoreRepaid = 0;

    allProducts.forEach((prod) => {
      const sponsor = (prod.sponsorName || "").trim();
      if (!sponsor) return;

      const prodCost = prod.costPrice || 0;
      const initialStock =
        prod.initialStock && prod.initialStock > 0 ? prod.initialStock : prod.stock;
      const investedAmount = roundMoney(initialStock * prodCost);

      // Calcular quantas unidades desse produto já foram vendidas
      const soldQty = sales.reduce((acc, s) => {
        return (
          acc +
          s.items.reduce((sum, it) => {
            const itId =
              (it.productId as any)?._id?.toString() || it.productId?.toString();
            return itId === prod._id.toString() ? sum + it.quantity : sum;
          }, 0)
        );
      }, 0);

      const costToRepay = roundMoney(soldQty * prodCost);

      totalStoreInvestment = roundMoney(totalStoreInvestment + investedAmount);
      totalStoreRepaid = roundMoney(totalStoreRepaid + costToRepay);

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
        expenseId: "store-prod",
        itemId: prod._id.toString(),
        expenseTitle: `Confecção Lojinha (${prod.name})`,
        description: `Tiragem de ${initialStock} unids a R$ ${prodCost.toFixed(2)} (${soldQty} vendidas)`,
        amount: investedAmount,
        repaidAmount: costToRepay,
        status:
          costToRepay >= investedAmount
            ? "REEMBOLSADO"
            : costToRepay > 0
            ? "REEMBOLSADO_PARCIAL"
            : "PENDENTE",
        isDonation: false,
        nature: "LOJINHA_INVESTIMENTO",
        repaymentHistory: [],
      });

      payerMap[sponsor].totalPaid = roundMoney(payerMap[sponsor].totalPaid + investedAmount);
      payerMap[sponsor].totalRepaid = roundMoney(payerMap[sponsor].totalRepaid + costToRepay);
    });

    const payersReport = Object.values(payerMap).map((p) => {
      const balance = roundMoney(Math.max(0, p.totalPaid - p.totalRepaid));
      return {
        ...p,
        balanceToRepay: balance,
        isFullyRepaid: p.totalPaid > 0 && balance === 0,
      };
    });

    // Totais de Receitas Extras
    const totalExtraIncomes = roundMoney(
      incomes.reduce((acc, inc) => acc + inc.amount, 0)
    );

    // Total de Arrecadação Global do Evento (Receitas Extras + Lucro Líquido da Lojinha)
    const totalAvailableEventFunds = roundMoney(totalExtraIncomes + lojinhaProfit);

    // Saldo Final Econômico do Retiro após cobrir todas as despesas
    const finalEventBalance = roundMoney(totalAvailableEventFunds - totalExpensesAmount);

    // DISPONIBILIDADE IMEDIATA NO CAIXA (Total de dinheiro físico/Pix arrecadado menos o que já foi devolvido aos irmãos)
    const totalGrossRevenueCollected = roundMoney(totalExtraIncomes + lojinhaRevenue);
    const totalActuallyPaidOut = roundMoney(totalExpensesRepaid + totalStoreRepaid);
    const immediateCashAvailable = roundMoney(totalGrossRevenueCollected - totalActuallyPaidOut);

    return {
      summary: {
        totalExpensesAmount,
        totalInfraExpenses,
        totalOperExpenses,
        totalExpensesRepaid,
        totalExpensesPendingRepay: roundMoney(Math.max(0, totalExpensesAmount - totalExpensesRepaid)),
        totalDonatedItemsCount,
        totalStoreInvestment,
        totalStoreRepaid,
        totalStorePendingRepay: roundMoney(Math.max(0, totalStoreInvestment - totalStoreRepaid)),
        totalExtraIncomes,
        lojinhaRevenue,
        lojinhaCost,
        lojinhaProfit,
        totalAvailableEventFunds,
        finalEventBalance,
        immediateCashAvailable,
        totalGrossRevenueCollected,
        totalActuallyPaidOut,
      },
      categoryTotals,
      payersReport,
      expenses,
      incomes,
    };
  }
}
