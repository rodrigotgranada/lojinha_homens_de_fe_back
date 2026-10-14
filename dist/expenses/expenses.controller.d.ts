import { ExpensesService } from "./expenses.service";
import { CreateExpenseGroupDto } from "./dto/create-expense-group.dto";
import { CreateExpenseItemDto, UpdateExpenseItemDto } from "./dto/create-expense-item.dto";
import { AddRepaymentDto } from "./dto/add-repayment.dto";
import { CreateIncomeDto } from "./dto/create-income.dto";
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    findAll(eventId: string): Promise<import("../schemas/expense.schema").Expense[]>;
    getSummary(eventId: string): Promise<{
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
            items: {
                expenseId: string;
                itemId: string;
                expenseTitle: string;
                description: string;
                amount: number;
                repaidAmount: number;
                status: string;
                isDonation: boolean;
                nature: string;
                repaymentHistory: import("../schemas/expense.schema").RepaymentRecord[];
            }[];
            totalPaid: number;
            totalRepaid: number;
            donationsCount: number;
        }[];
        expenses: (import("mongoose").Document<unknown, {}, import("../schemas/expense.schema").Expense, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/expense.schema").Expense & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        incomes: (import("mongoose").Document<unknown, {}, import("../schemas/event-income.schema").EventIncome, {}, import("mongoose").DefaultSchemaOptions> & import("../schemas/event-income.schema").EventIncome & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        storeProductsReport: any[];
    }>;
    create(createDto: CreateExpenseGroupDto): Promise<import("../schemas/expense.schema").Expense>;
    addItem(id: string, itemDto: CreateExpenseItemDto): Promise<import("../schemas/expense.schema").Expense>;
    addRepayment(id: string, itemId: string, repaymentDto: AddRepaymentDto): Promise<import("../schemas/expense.schema").Expense>;
    updateItem(id: string, itemId: string, updateDto: UpdateExpenseItemDto): Promise<import("../schemas/expense.schema").Expense>;
    deleteItem(id: string, itemId: string, operatorName?: string): Promise<import("../schemas/expense.schema").Expense>;
    delete(id: string, operatorName?: string): Promise<void>;
    findIncomes(eventId: string): Promise<import("../schemas/event-income.schema").EventIncome[]>;
    createIncome(incomeDto: CreateIncomeDto): Promise<import("../schemas/event-income.schema").EventIncome>;
    deleteIncome(id: string, operatorName?: string): Promise<void>;
}
