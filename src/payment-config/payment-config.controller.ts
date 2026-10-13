import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { PaymentConfigService } from "./payment-config.service";
import {
  CreatePaymentConfigDto,
  UpdatePaymentConfigDto,
} from "./dto/payment-config.dto";

@Controller("payment-configs")
export class PaymentConfigController {
  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  @Get()
  async findAll() {
    return this.paymentConfigService.findAll();
  }

  @Get("active")
  async getActive() {
    return this.paymentConfigService.getActive();
  }

  @Post()
  async create(@Body() dto: CreatePaymentConfigDto) {
    return this.paymentConfigService.create(dto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePaymentConfigDto
  ) {
    return this.paymentConfigService.update(id, dto);
  }

  @Patch(":id/default")
  async setDefault(@Param("id") id: string) {
    return this.paymentConfigService.setDefault(id);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.paymentConfigService.delete(id);
  }
}
