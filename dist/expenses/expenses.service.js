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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const expense_schema_1 = require("../schemas/expense.schema");
const event_income_schema_1 = require("../schemas/event-income.schema");
const sale_schema_1 = require("../schemas/sale.schema");
const product_schema_1 = require("../schemas/product.schema");
const logs_service_1 = require("../logs/logs.service");
const money_util_1 = require("../common/utils/money.util");
let ExpensesService = class ExpensesService {
    expenseModel;
    eventIncomeModel;
    saleModel;
    productModel;
    logsService;
    constructor(expenseModel, eventIncomeModel, saleModel, productModel, logsService) {
        this.expenseModel = expenseModel;
        this.eventIncomeModel = eventIncomeModel;
        this.saleModel = saleModel;
        this.productModel = productModel;
        this.logsService = logsService;
    }
    async findAll(eventId) {
        if (!eventId || !mongoose_2.Types.ObjectId.isValid(eventId)) {
            return this.expenseModel.find().sort({ createdAt: -1 }).exec();
        }
        return this.expenseModel
            .find({ eventId: new mongoose_2.Types.ObjectId(eventId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async create(createDto) {
        const category = createDto.category || "OBRA";
        const nature = createDto.nature ||
            (category === "OBRA" || category === "LOCACAO" || category === "ESTRUTURA"
                ? "INFRAESTRUTURA"
                : "OPERACIONAL");
        const expense = new this.expenseModel({
            eventId: new mongoose_2.Types.ObjectId(createDto.eventId),
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
    async addItem(expenseId, itemDto) {
        const expense = await this.expenseModel.findById(expenseId).exec();
        if (!expense) {
            throw new common_1.NotFoundException(`Despesa #${expenseId} não encontrada`);
        }
        const isDonation = Boolean(itemDto.isDonation);
        const amount = isDonation ? 0 : (0, money_util_1.roundMoney)(Number(itemDto.amount) || 0);
        const status = isDonation ? "DOACAO" : "PENDENTE";
        const newItem = {
            _id: new mongoose_2.Types.ObjectId(),
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
            description: `Adicionou o item "${itemDto.description}" (${isDonation ? "Doação" : "R$ " + amount.toFixed(2)}) pago/doado por ${itemDto.paidBy} na obra "${expense.title}"`,
            metadata: { expenseId, item: newItem },
        });
        return saved;
    }
    async addRepayment(expenseId, itemId, dto) {
        const expense = await this.expenseModel.findById(expenseId).exec();
        if (!expense) {
            throw new common_1.NotFoundException(`Despesa #${expenseId} não encontrada`);
        }
        const item = expense.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            throw new common_1.NotFoundException(`Item #${itemId} não encontrado na despesa`);
        }
        if (item.isDonation) {
            throw new common_1.BadRequestException("Itens marcados como doação não recebem reembolso.");
        }
        const repayAmount = (0, money_util_1.roundMoney)(Number(dto.amount) || 0);
        if (repayAmount <= 0) {
            throw new common_1.BadRequestException("O valor do reembolso deve ser maior que zero.");
        }
        const currentRepaid = (0, money_util_1.roundMoney)(item.repaidAmount || 0);
        const newTotalRepaid = (0, money_util_1.roundMoney)(currentRepaid + repayAmount);
        if (newTotalRepaid > item.amount) {
            const maxAllowed = (0, money_util_1.roundMoney)(item.amount - currentRepaid);
            throw new common_1.BadRequestException(`O valor informado (R$ ${repayAmount.toFixed(2)}) ultrapassa o saldo pendente de R$ ${maxAllowed.toFixed(2)} (Valor original: R$ ${item.amount.toFixed(2)}).`);
        }
        const repaymentRecord = {
            _id: new mongoose_2.Types.ObjectId(),
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
        }
        else if (item.repaidAmount > 0) {
            item.status = "REEMBOLSADO_PARCIAL";
        }
        else {
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
    async updateItem(expenseId, itemId, updateDto) {
        const expense = await this.expenseModel.findById(expenseId).exec();
        if (!expense) {
            throw new common_1.NotFoundException(`Despesa #${expenseId} não encontrada`);
        }
        const item = expense.items.find((i) => i._id.toString() === itemId);
        if (!item) {
            throw new common_1.NotFoundException(`Item #${itemId} não encontrado na despesa`);
        }
        if (updateDto.description !== undefined)
            item.description = updateDto.description;
        if (updateDto.paidBy !== undefined)
            item.paidBy = updateDto.paidBy.trim();
        if (updateDto.payerPhone !== undefined)
            item.payerPhone = updateDto.payerPhone;
        if (updateDto.notes !== undefined)
            item.notes = updateDto.notes;
        if (updateDto.receiptUrl !== undefined)
            item.receiptUrl = updateDto.receiptUrl;
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
            item.amount = (0, money_util_1.roundMoney)(Number(updateDto.amount) || 0);
        }
        if (!item.isDonation && updateDto.repaidAmount !== undefined) {
            const requestedRepaid = (0, money_util_1.roundMoney)(Number(updateDto.repaidAmount) || 0);
            if (requestedRepaid > item.amount) {
                throw new common_1.BadRequestException(`O valor reembolsado (R$ ${requestedRepaid.toFixed(2)}) não pode ser superior ao valor da despesa (R$ ${item.amount.toFixed(2)}).`);
            }
            item.repaidAmount = requestedRepaid;
            if (item.repaidAmount >= item.amount && item.amount > 0) {
                item.status = "REEMBOLSADO";
            }
            else if (item.repaidAmount > 0) {
                item.status = "REEMBOLSADO_PARCIAL";
            }
            else {
                item.status = "PENDENTE";
            }
        }
        else if (updateDto.status !== undefined && !item.isDonation) {
            item.status = updateDto.status;
            if (item.status === "REEMBOLSADO") {
                item.repaidAmount = item.amount;
            }
            else if (item.status === "PENDENTE") {
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
    async deleteItem(expenseId, itemId, operatorName) {
        const expense = await this.expenseModel.findById(expenseId).exec();
        if (!expense) {
            throw new common_1.NotFoundException(`Despesa #${expenseId} não encontrada`);
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
    async delete(expenseId, operatorName) {
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
    recalculateTotals(expense) {
        let total = 0;
        let repaid = 0;
        for (const item of expense.items) {
            if (!item.isDonation) {
                total = (0, money_util_1.roundMoney)(total + (item.amount || 0));
                repaid = (0, money_util_1.roundMoney)(repaid + (item.repaidAmount || 0));
            }
        }
        expense.totalAmount = total;
        expense.totalRepaid = repaid;
    }
    async findIncomes(eventId) {
        if (!eventId || !mongoose_2.Types.ObjectId.isValid(eventId)) {
            return this.eventIncomeModel.find().sort({ date: -1 }).exec();
        }
        return this.eventIncomeModel
            .find({ eventId: new mongoose_2.Types.ObjectId(eventId) })
            .sort({ date: -1 })
            .exec();
    }
    async createIncome(incomeDto) {
        const income = new this.eventIncomeModel({
            eventId: new mongoose_2.Types.ObjectId(incomeDto.eventId),
            title: incomeDto.title,
            type: incomeDto.type,
            amount: (0, money_util_1.roundMoney)(Number(incomeDto.amount) || 0),
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
    async deleteIncome(id, operatorName) {
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
    async getEventFinancialSummary(eventId) {
        const objEventId = mongoose_2.Types.ObjectId.isValid(eventId) ? new mongoose_2.Types.ObjectId(eventId) : null;
        const expenses = await this.expenseModel.find({
            ...(objEventId ? { eventId: objEventId } : {}),
        }).exec();
        const incomes = await this.eventIncomeModel.find({
            ...(objEventId ? { eventId: objEventId } : {}),
        }).exec();
        const sales = await this.saleModel.find({
            ...(objEventId ? { $or: [{ eventId: objEventId }, { eventId }] } : {}),
            status: "PAGO",
        }).populate("items.productId").exec();
        const lojinhaRevenue = (0, money_util_1.roundMoney)(sales.reduce((acc, s) => acc + s.totalPrice, 0));
        const lojinhaCost = (0, money_util_1.roundMoney)(sales.reduce((acc, s) => {
            return (acc +
                s.items.reduce((sum, item) => {
                    const prodObj = item.productId;
                    const currentProdCost = prodObj?.costPrice ?? 0;
                    const cost = item.costAtPurchase && item.costAtPurchase > 0
                        ? item.costAtPurchase
                        : currentProdCost;
                    return sum + item.quantity * cost;
                }, 0));
        }, 0));
        const lojinhaProfit = (0, money_util_1.roundMoney)(lojinhaRevenue - lojinhaCost);
        let totalExpensesAmount = 0;
        let totalExpensesRepaid = 0;
        let totalDonatedItemsCount = 0;
        let totalInfraExpenses = 0;
        let totalOperExpenses = 0;
        let totalStoreInvestment = 0;
        let totalStoreRepaid = 0;
        const payerMap = {};
        const categoryTotals = {};
        expenses.forEach((exp) => {
            categoryTotals[exp.category] = (0, money_util_1.roundMoney)((categoryTotals[exp.category] || 0) + exp.totalAmount);
            const isInfra = exp.nature === "INFRAESTRUTURA" ||
                exp.category === "OBRA" ||
                exp.category === "LOCACAO" ||
                exp.category === "ESTRUTURA";
            const isLojinha = exp.nature === "LOJINHA_INVESTIMENTO" || exp.nature === "LOJINHA_DOACAO" || exp.category === "LOJINHA";
            if (isInfra) {
                totalInfraExpenses = (0, money_util_1.roundMoney)(totalInfraExpenses + exp.totalAmount);
            }
            else if (isLojinha) {
                totalStoreInvestment = (0, money_util_1.roundMoney)(totalStoreInvestment + exp.totalAmount);
                totalStoreRepaid = (0, money_util_1.roundMoney)(totalStoreRepaid + exp.totalRepaid);
            }
            else {
                totalOperExpenses = (0, money_util_1.roundMoney)(totalOperExpenses + exp.totalAmount);
            }
            exp.items.forEach((item) => {
                if (item.isDonation) {
                    totalDonatedItemsCount += 1;
                }
                else {
                    totalExpensesAmount = (0, money_util_1.roundMoney)(totalExpensesAmount + item.amount);
                    totalExpensesRepaid = (0, money_util_1.roundMoney)(totalExpensesRepaid + item.repaidAmount);
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
                    expenseId: exp.id || exp._id?.toString(),
                    itemId: item._id?.toString(),
                    expenseTitle: exp.title,
                    description: item.description,
                    amount: (0, money_util_1.roundMoney)(item.amount),
                    repaidAmount: (0, money_util_1.roundMoney)(item.repaidAmount),
                    status: item.status,
                    isDonation: item.isDonation,
                    nature: exp.nature || (isInfra ? "INFRAESTRUTURA" : isLojinha ? "LOJINHA_INVESTIMENTO" : "OPERACIONAL"),
                    repaymentHistory: item.repaymentHistory || [],
                });
                if (item.isDonation) {
                    payerMap[payer].donationsCount += 1;
                }
                else {
                    payerMap[payer].totalPaid = (0, money_util_1.roundMoney)(payerMap[payer].totalPaid + item.amount);
                    payerMap[payer].totalRepaid = (0, money_util_1.roundMoney)(payerMap[payer].totalRepaid + item.repaidAmount);
                }
            });
        });
        const storeProductsReport = [];
        const payersReport = Object.values(payerMap).map((p) => {
            const balance = (0, money_util_1.roundMoney)(Math.max(0, p.totalPaid - p.totalRepaid));
            return {
                ...p,
                balanceToRepay: balance,
                isFullyRepaid: p.totalPaid > 0 ? balance === 0 : true,
            };
        });
        const totalExtraIncomes = (0, money_util_1.roundMoney)(incomes.reduce((acc, inc) => acc + inc.amount, 0));
        const totalAvailableEventFunds = (0, money_util_1.roundMoney)(totalExtraIncomes + lojinhaRevenue);
        const finalEventBalance = (0, money_util_1.roundMoney)(totalAvailableEventFunds - totalExpensesAmount);
        const totalGrossRevenueCollected = (0, money_util_1.roundMoney)(totalExtraIncomes + lojinhaRevenue);
        const totalActuallyPaidOut = (0, money_util_1.roundMoney)(totalExpensesRepaid);
        const immediateCashAvailable = (0, money_util_1.roundMoney)(totalGrossRevenueCollected - totalActuallyPaidOut);
        return {
            summary: {
                totalExpensesAmount,
                totalInfraExpenses,
                totalOperExpenses,
                totalExpensesRepaid,
                totalExpensesPendingRepay: (0, money_util_1.roundMoney)(Math.max(0, totalExpensesAmount - totalExpensesRepaid)),
                totalDonatedItemsCount,
                totalStoreInvestment,
                totalStoreRepaid,
                totalStorePendingRepay: (0, money_util_1.roundMoney)(Math.max(0, totalStoreInvestment - totalStoreRepaid)),
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
            storeProductsReport,
        };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(expense_schema_1.Expense.name)),
    __param(1, (0, mongoose_1.InjectModel)(event_income_schema_1.EventIncome.name)),
    __param(2, (0, mongoose_1.InjectModel)(sale_schema_1.Sale.name)),
    __param(3, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        logs_service_1.LogsService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map