import { Injectable, OnApplicationBootstrap, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale } from "../schemas/sale.schema";
import { User } from "../schemas/user.schema";
import { Product } from "../schemas/product.schema";
import { Category } from "../schemas/category.schema";
import { Event } from "../schemas/event.schema";

@Injectable()
export class SyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SyncService.name);
  private isSyncing = false;
  private lastPullTimestamp = 0;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Sale.name) private readonly saleModel: Model<Sale>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  onApplicationBootstrap() {
    const isLocalServer = this.configService.get<string>("IS_LOCAL_SERVER") === "true";
    
    if (isLocalServer) {
      this.logger.log("INICIANDO SERVIÇO DE SINCRONIZAÇÃO LOCAL NO NOTEBOOK...");
      const intervalMs = parseInt(this.configService.get<string>("SYNC_INTERVAL_MS") || "30000", 10); // Default 30s
      
      // Executa a primeira sincronização após 5 segundos da inicialização
      setTimeout(() => this.runSyncCycle(), 5000);

      // Agenda as próximas execuções periódicas
      setInterval(() => this.runSyncCycle(), intervalMs);
    } else {
      this.logger.log("Servidor rodando em ambiente de NUVEM. Serviço de sincronização local inativo.");
    }
  }

  async runSyncCycle() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const remoteUrl = this.configService.get<string>("REMOTE_API_URL");
      if (!remoteUrl) {
        this.logger.warn("REMOTE_API_URL não configurada no arquivo .env. Pulando sincronização.");
        this.isSyncing = false;
        return;
      }

      // 1. Testar conexão com a nuvem antes de tentar sincronizar
      const isOnline = await this.checkRemoteConnectivity(remoteUrl);
      if (!isOnline) {
        this.isSyncing = false;
        return;
      }

      this.logger.log("Conectividade com a Nuvem restabelecida. Iniciando ciclo...");

      // 2. Executar PUSH (Local -> Nuvem)
      await this.pushLocalDataToRemote(remoteUrl);

      // 3. Executar PULL (Nuvem -> Local)
      await this.pullRemoteDataToLocal(remoteUrl);

      this.logger.log("Ciclo de sincronização finalizado com sucesso.");
    } catch (err) {
      this.logger.error("Erro durante o ciclo de sincronização:", err.message);
    } finally {
      this.isSyncing = false;
    }
  }

  private async checkRemoteConnectivity(remoteUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${remoteUrl}/sync/health`, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) {
        this.logger.warn(`Servidor remoto respondeu com status inválido no health: ${response.status}. Pulando sincronização.`);
        return false;
      }
      return true;
    } catch (e) {
      this.logger.warn(`Sem internet ou servidor remoto indisponível em ${remoteUrl}. Aguardando próxima rodada.`);
      return false;
    }
  }

  private async pushLocalDataToRemote(remoteUrl: string) {
    // Buscar vendas pendentes
    const pendingSales = await this.saleModel.find({ synced: { $ne: true } }).exec();
    
    // Buscar usuários (clientes) pendentes
    const pendingUsers = await this.userModel.find({ synced: { $ne: true } }).exec();

    if (pendingSales.length === 0 && pendingUsers.length === 0) {
      this.logger.log("Nenhum dado pendente de sincronização para envio (Push).");
      return;
    }

    this.logger.log(`Encontrados para PUSH: ${pendingSales.length} vendas e ${pendingUsers.length} usuários.`);

    try {
      const payload = {
        sales: pendingSales,
        users: pendingUsers
      };

      const response = await fetch(`${remoteUrl}/sync/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Servidor remoto respondeu com status ${response.status}`);
      }

      const result = await response.json() as { success: boolean; errors?: string[] };
      if (result.success) {
        this.logger.log("Dados enviados e aceitos pela nuvem com sucesso.");

        // Atualizar status de sincronização local das vendas
        if (pendingSales.length > 0) {
          const saleIds = pendingSales.map(s => s._id);
          await this.saleModel.updateMany(
            { _id: { $in: saleIds } },
            { $set: { synced: true, synchronizedAt: new Date() } }
          ).exec();
        }

        // Atualizar status de sincronização local dos usuários
        if (pendingUsers.length > 0) {
          const userIds = pendingUsers.map(u => u._id);
          await this.userModel.updateMany(
            { _id: { $in: userIds } },
            { $set: { synced: true, synchronizedAt: new Date() } }
          ).exec();
        }

        this.logger.log("Status de sincronização local atualizado.");
      } else {
        this.logger.warn(`A nuvem processou o PUSH mas reportou erros parciais: ${result.errors?.join(" | ")}`);
      }
    } catch (err) {
      this.logger.error("Falha ao enviar dados pendentes (Push):", err.message);
      throw err;
    }
  }

  private async pullRemoteDataToLocal(remoteUrl: string) {
    this.logger.log(`Iniciando PULL de atualizações na Nuvem desde timestamp: ${new Date(this.lastPullTimestamp).toISOString()}`);

    try {
      const response = await fetch(`${remoteUrl}/sync/pull?lastSyncDate=${this.lastPullTimestamp}`);
      if (!response.ok) {
        throw new Error(`Servidor remoto respondeu com status ${response.status}`);
      }

      const data = await response.json() as {
        products: any[];
        categories: any[];
        events: any[];
        users: any[];
        sales: any[];
        timestamp: number;
      };

      // 1. Atualizar Categorias locais
      if (data.categories?.length > 0) {
        this.logger.log(`Atualizando ${data.categories.length} categorias vindas da Nuvem...`);
        for (const cat of data.categories) {
          await this.categoryModel.findByIdAndUpdate(
            cat._id,
            { ...cat },
            { upsert: true, new: true }
          ).exec();
        }
      }

      // 2. Atualizar Eventos locais
      if (data.events?.length > 0) {
        this.logger.log(`Atualizando ${data.events.length} eventos vindos da Nuvem...`);
        for (const ev of data.events) {
          await this.eventModel.findByIdAndUpdate(
            ev._id,
            { ...ev },
            { upsert: true, new: true }
          ).exec();
        }
      }

      // 3. Atualizar Produtos locais
      if (data.products?.length > 0) {
        this.logger.log(`Atualizando ${data.products.length} produtos vindos da Nuvem...`);
        for (const prod of data.products) {
          // Atualiza dados locais (preserva o estoque local caso seja alterado)
          // Mas se o estoque na nuvem for alterado por adm, pode sobrescrever se necessário.
          // Aqui, fazemos upsert mantendo o _id original.
          await this.productModel.findByIdAndUpdate(
            prod._id,
            { ...prod },
            { upsert: true, new: true }
          ).exec();
        }
      }

      // 4. Atualizar Usuários (Clientes) locais
      if (data.users?.length > 0) {
        this.logger.log(`Atualizando ${data.users.length} usuários (clientes) vindos da Nuvem...`);
        for (const user of data.users) {
          await this.userModel.findByIdAndUpdate(
            user._id,
            { ...user, synced: true, synchronizedAt: new Date() },
            { upsert: true, new: true }
          ).exec();
        }
      }

      // 5. Atualizar Vendas locais
      if (data.sales?.length > 0) {
        this.logger.log(`Atualizando ${data.sales.length} vendas vindas da Nuvem...`);
        for (const sale of data.sales) {
          await this.saleModel.findByIdAndUpdate(
            sale._id,
            { ...sale, synced: true, synchronizedAt: new Date() },
            { upsert: true, new: true }
          ).exec();
        }
      }

      // Salva o timestamp retornado pelo servidor remoto para o próximo ciclo
      this.lastPullTimestamp = data.timestamp || Date.now();
      this.logger.log(`Pull completo. Novo timestamp de controle de sincronização: ${new Date(this.lastPullTimestamp).toISOString()}`);
    } catch (err) {
      this.logger.error("Falha ao puxar atualizações (Pull):", err.message);
      throw err;
    }
  }
}
