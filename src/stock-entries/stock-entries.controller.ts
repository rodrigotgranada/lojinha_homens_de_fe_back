import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { StockEntriesService } from "./stock-entries.service";
import { CreateStockEntryDto } from "./dto/stock-entry.dto";

@Controller("stock-entries")
export class StockEntriesController {
  constructor(private readonly stockEntriesService: StockEntriesService) {}

  @Get()
  async findAll(
    @Query("productId") productId?: string,
    @Query("eventId") eventId?: string
  ) {
    return this.stockEntriesService.findAll(productId, eventId);
  }

  @Get("product/:productId")
  async findByProduct(@Param("productId") productId: string) {
    return this.stockEntriesService.findByProduct(productId);
  }

  @Get("event/:eventId")
  async findByEvent(@Param("eventId") eventId: string) {
    return this.stockEntriesService.findByEvent(eventId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.stockEntriesService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateStockEntryDto) {
    return this.stockEntriesService.create(createDto);
  }

  @Delete(":id")
  async delete(
    @Param("id") id: string,
    @Query("operatorName") operatorName?: string
  ) {
    return this.stockEntriesService.delete(id, operatorName);
  }
}
