import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SyncService } from "./sync.service";
import { Sale } from "../schemas/sale.schema";
import { User } from "../schemas/user.schema";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { Event } from "../schemas/event.schema";

@Controller("sync")
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(
    private readonly syncService: SyncService,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  @Get("health")
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return { status: "ok", timestamp: Date.now() };
  }

  @Post("trigger")
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync() {
    // Dispara em segundo plano para não travar a requisição HTTP
    this.syncService.runSyncCycle().catch(err => {
      this.logger.error("Erro ao disparar ciclo de sync sob demanda:", err.message);
    });
    return { status: "triggered" };
  }

  @Post("push")
  @HttpCode(HttpStatus.OK)
  async pushData(@Body() payload: { sales: any[]; users: any[] }) {
    this.logger.log(`Recebendo PUSH da Nuvem: ${payload.sales?.length || 0} vendas e ${payload.users?.length || 0} usuários.`);

    // 1. Processar Usuários (Clientes)
    if (payload.users && payload.users.length > 0) {
      for (const userData of payload.users) {
        // Remove virtuals que possam quebrar a validação estrita do Mongo
        const { id, ...cleanUserData } = userData;
        
        // Garante que o synced é gravado como true na nuvem
        cleanUserData.synced = true;
        cleanUserData.synchronizedAt = new Date();

        await this.userModel.findByIdAndUpdate(
          userData._id || id,
          { $set: cleanUserData },
          { upsert: true, new: true }
        ).exec();
      }
    }

    // 2. Processar Vendas
    if (payload.sales && payload.sales.length > 0) {
      for (const saleData of payload.sales) {
        const { id, ...cleanSaleData } = saleData;

        // Garante que o synced é gravado como true na nuvem
        cleanSaleData.synced = true;
        cleanSaleData.synchronizedAt = new Date();

        await this.saleModel.findByIdAndUpdate(
          saleData._id || id,
          { $set: cleanSaleData },
          { upsert: true, new: true }
        ).exec();
      }
    }

    return { success: true };
  }

  @Get("pull")
  async pullData(@Query("lastSyncDate") lastSyncDate: string) {
    const timestamp = parseInt(lastSyncDate || "0", 10);
    const filterDate = new Date(timestamp);
    
    this.logger.log(`Recebendo PULL da Nuvem. Filtrando atualizações a partir de: ${filterDate.toISOString()}`);

    // Buscar categorias modificadas após a data informada
    const categories = await this.categoryModel.find({
      updatedAt: { $gt: filterDate }
    }).exec();

    // Buscar eventos modificados após a data informada
    const events = await this.eventModel.find({
      updatedAt: { $gt: filterDate }
    }).exec();

    // Buscar produtos modificados após a data informada
    const products = await this.productModel.find({
      updatedAt: { $gt: filterDate }
    }).exec();

    return {
      categories,
      events,
      products,
      timestamp: Date.now() // Retorna o timestamp de agora para o controle do cliente no próximo ciclo
    };
  }
}
