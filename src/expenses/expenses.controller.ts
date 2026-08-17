import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from "@nestjs/common";
import { ExpensesService } from "./expenses.service";

@Controller("expenses")
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findAll(@Query("eventId") eventId: string) {
    return this.expensesService.findAll(eventId);
  }

  @Get("summary/:eventId")
  async getSummary(@Param("eventId") eventId: string) {
    return this.expensesService.getEventFinancialSummary(eventId);
  }

  @Post()
  async create(@Body() createDto: any) {
    return this.expensesService.create(createDto);
  }

  @Post(":id/items")
  async addItem(@Param("id") id: string, @Body() itemDto: any) {
    return this.expensesService.addItem(id, itemDto);
  }

  @Patch(":id/items/:itemId")
  async updateItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body() updateDto: any
  ) {
    return this.expensesService.updateItem(id, itemId, updateDto);
  }

  @Delete(":id/items/:itemId")
  async deleteItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body("operatorName") operatorName?: string
  ) {
    return this.expensesService.deleteItem(id, itemId, operatorName);
  }

  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @Body("operatorName") operatorName?: string
  ) {
    return this.expensesService.delete(id, operatorName);
  }

  // --- Rotas de Entradas de Receita do Evento ---
  @Get("incomes/list")
  async findIncomes(@Query("eventId") eventId: string) {
    return this.expensesService.findIncomes(eventId);
  }

  @Post("incomes")
  async createIncome(@Body() incomeDto: any) {
    return this.expensesService.createIncome(incomeDto);
  }

  @Delete("incomes/:id")
  async deleteIncome(
    @Param("id") id: string,
    @Body("operatorName") operatorName?: string
  ) {
    return this.expensesService.deleteIncome(id, operatorName);
  }
}
