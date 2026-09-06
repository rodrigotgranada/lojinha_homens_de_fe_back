import { Controller, Get, Post, Patch, Body, Param, Query } from "@nestjs/common";
import { SalesService } from "./sales.service";
import { CreateSaleDto, CancelSaleDto, UpdateSaleStatusDto } from "./dto/sale.dto";

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
  async create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Patch(":id")
  async updateStatus(@Param("id") id: string, @Body() body: UpdateSaleStatusDto) {
    return this.salesService.updateStatus(id, body.status);
  }

  @Post(":id/cancel")
  async cancelSale(@Param("id") id: string, @Body() body: CancelSaleDto) {
    return this.salesService.cancelSale(id, body.operatorId || "system");
  }
}
