import { Controller, Get, Post, Patch, Body, Query, Param } from "@nestjs/common";
import { SalesService } from "./sales.service";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(@Query("customerId") customerId?: string) {
    if (customerId) {
      return this.salesService.findByCustomer(customerId);
    }
    return this.salesService.findAll();
  }

  @Post()
  async create(@Body() createSaleDto: any) {
    return this.salesService.create(createSaleDto);
  }

  @Patch(":id")
  async updateStatus(@Param("id") id: string, @Body() body: any) {
    return this.salesService.updateStatus(id, body.status);
  }

  @Post(":id/cancel")
  async cancelSale(@Param("id") id: string, @Body("operatorId") operatorId: string) {
    return this.salesService.cancelSale(id, operatorId);
  }
}
