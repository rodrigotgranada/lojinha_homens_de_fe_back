import { Model, Types } from "mongoose";
import { Expense, RepaymentRecord } from "../schemas/expense.schema";
import { EventIncome } from "../schemas/event-income.schema";
import { Sale } from "../schemas/sale.schema";
import { Product } from "../schemas/product.schema";
import { LogsService } from "../logs/logs.service";
import { CreateExpenseGroupDto } from "./dto/create-expense-group.dto";
import { CreateExpenseItemDto, UpdateExpenseItemDto } from "./dto/create-expense-item.dto";
import { AddRepaymentDto } from "./dto/add-repayment.dto";
import { CreateIncomeDto } from "./dto/create-income.dto";
export declare class ExpensesService {
    private readonly expenseModel;
    private readonly eventIncomeModel;
    private readonly saleModel;
    private readonly productModel;
    private readonly logsService;
    constructor(expenseModel: Model<Expense>, eventIncomeModel: Model<EventIncome>, saleModel: Model<Sale>, productModel: Model<Product>, logsService: LogsService);
    findAll(eventId: string): Promise<Expense[]>;
    create(createDto: CreateExpenseGroupDto): Promise<Expense>;
    addItem(expenseId: string, itemDto: CreateExpenseItemDto): Promise<Expense>;
    addRepayment(expenseId: string, itemId: string, dto: AddRepaymentDto): Promise<Expense>;
    updateItem(expenseId: string, itemId: string, updateDto: UpdateExpenseItemDto): Promise<Expense>;
    deleteItem(expenseId: string, itemId: string, operatorName?: string): Promise<Expense>;
    delete(expenseId: string, operatorName?: string): Promise<void>;
    private recalculateTotals;
    findIncomes(eventId: string): Promise<EventIncome[]>;
    createIncome(incomeDto: CreateIncomeDto): Promise<EventIncome>;
    deleteIncome(id: string, operatorName?: string): Promise<void>;
    getEventFinancialSummary(eventId: string): Promise<{
        summary: {
            totalExpensesAmount: number;
            totalInfraExpenses: number;
            totalOperExpenses: number;
            totalExpensesRepaid: number;
            totalExpensesPendingRepay: number;
            totalDonatedItemsCount: number;
            totalStoreInvestment: number;
            totalStoreRepaid: number;
            totalStorePendingRepay: number;
            totalExtraIncomes: number;
            lojinhaRevenue: number;
            lojinhaCost: number;
            lojinhaProfit: number;
            totalAvailableEventFunds: number;
            finalEventBalance: number;
            immediateCashAvailable: number;
            totalGrossRevenueCollected: number;
            totalActuallyPaidOut: number;
        };
        categoryTotals: Record<string, number>;
        payersReport: {
            balanceToRepay: number;
            isFullyRepaid: boolean;
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
            donationsCount: number;
        }[];
        expenses: (import("mongoose").Document<unknown, {}, Expense, {}, import("mongoose").DefaultSchemaOptions> & Expense & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        incomes: (import("mongoose").Document<unknown, {}, EventIncome, {}, import("mongoose").DefaultSchemaOptions> & EventIncome & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        storeProductsReport: any[];
    }>;
}
