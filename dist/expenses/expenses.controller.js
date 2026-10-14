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
exports.ExpensesController = void 0;
const common_1 = require("@nestjs/common");
const expenses_service_1 = require("./expenses.service");
const create_expense_group_dto_1 = require("./dto/create-expense-group.dto");
const create_expense_item_dto_1 = require("./dto/create-expense-item.dto");
const add_repayment_dto_1 = require("./dto/add-repayment.dto");
const create_income_dto_1 = require("./dto/create-income.dto");
let ExpensesController = class ExpensesController {
    expensesService;
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    async findAll(eventId) {
        return this.expensesService.findAll(eventId);
    }
    async getSummary(eventId) {
        return this.expensesService.getEventFinancialSummary(eventId);
    }
    async create(createDto) {
        return this.expensesService.create(createDto);
    }
    async addItem(id, itemDto) {
        return this.expensesService.addItem(id, itemDto);
    }
    async addRepayment(id, itemId, repaymentDto) {
        return this.expensesService.addRepayment(id, itemId, repaymentDto);
    }
    async updateItem(id, itemId, updateDto) {
        return this.expensesService.updateItem(id, itemId, updateDto);
    }
    async deleteItem(id, itemId, operatorName) {
        return this.expensesService.deleteItem(id, itemId, operatorName);
    }
    async delete(id, operatorName) {
        return this.expensesService.delete(id, operatorName);
    }
    async findIncomes(eventId) {
        return this.expensesService.findIncomes(eventId);
    }
    async createIncome(incomeDto) {
        return this.expensesService.createIncome(incomeDto);
    }
    async deleteIncome(id, operatorName) {
        return this.expensesService.deleteIncome(id, operatorName);
    }
};
exports.ExpensesController = ExpensesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("summary/:eventId"),
    __param(0, (0, common_1.Param)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_group_dto_1.CreateExpenseGroupDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/items"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_expense_item_dto_1.CreateExpenseItemDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "addItem", null);
__decorate([
    (0, common_1.Post)(":id/items/:itemId/repayments"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("itemId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_repayment_dto_1.AddRepaymentDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "addRepayment", null);
__decorate([
    (0, common_1.Patch)(":id/items/:itemId"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("itemId")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_expense_item_dto_1.UpdateExpenseItemDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(":id/items/:itemId"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("itemId")),
    __param(2, (0, common_1.Body)("operatorName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("operatorName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)("incomes/list"),
    __param(0, (0, common_1.Query)("eventId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "findIncomes", null);
__decorate([
    (0, common_1.Post)("incomes"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_income_dto_1.CreateIncomeDto]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "createIncome", null);
__decorate([
    (0, common_1.Delete)("incomes/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("operatorName")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExpensesController.prototype, "deleteIncome", null);
exports.ExpensesController = ExpensesController = __decorate([
    (0, common_1.Controller)("expenses"),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesController);
//# sourceMappingURL=expenses.controller.js.map