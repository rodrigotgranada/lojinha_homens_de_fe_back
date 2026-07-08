import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { LogsService } from "./logs.service";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  async create(@Body() createLogDto: any) {
    return this.logsService.create(createLogDto);
  }

  @Get()
  async findAll(@Query("productId") productId?: string) {
    return this.logsService.findAll(productId);
  }
}
