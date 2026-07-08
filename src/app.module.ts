import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule, InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FirebaseModule } from "./firebase/firebase.module";
import { FirebaseService } from "./firebase/firebase.service";
import { WebsocketModule } from "./websocket/websocket.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { SalesModule } from "./sales/sales.module";
import { EventsModule } from "./events/events.module";
import { LogsModule } from "./logs/logs.module";
import { CategoriesModule } from "./categories/categories.module";

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    
    // Async MongoDB connection loaded from env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URI") || "mongodb://localhost:27017/lojinha",
      }),
      inject: [ConfigService],
    }),

    // Custom modules
    FirebaseModule,
    WebsocketModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    EventsModule,
    LogsModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly firebaseService: FirebaseService
  ) {}

  async onApplicationBootstrap() {
    console.log("\n=================================");
    
    if (this.connection.readyState === 1) {
      console.log("\x1b[32m%s\x1b[0m", "MONGO CONNECTED");
      await this.seedDatabase();
    } else {
      console.log("\x1b[31m%s\x1b[0m", "MONGO NOT CONNECTED");
    }

    if (this.firebaseService.isConnected()) {
      console.log("\x1b[32m%s\x1b[0m", "STORAGE CONNECTED");
    } else {
      console.log("\x1b[33m%s\x1b[0m", "STORAGE RUNNING LOCALLY (FALLBACK)");
    }
    
    console.log("=================================\n");
  }

  private async seedDatabase() {
    try {
      const UserModel = this.connection.model("User");
      const ProductModel = this.connection.model("Product");
      const EventModel = this.connection.model("Event");
      const CategoryModel = this.connection.model("Category");

      // 1. Seed Users
      const userCount = await UserModel.countDocuments().exec();
      if (userCount === 0) {
        console.log("Seeding users...");
        await UserModel.create([
          {
            cpf: "11111111111",
            firstName: "Gabriel",
            lastName: "Admin",
            phone: "53988888881",
            email: "gabriel.admin@email.com",
            role: "ADMIN",
          },
          {
            cpf: "22222222222",
            firstName: "Lucas",
            lastName: "Admin",
            phone: "53988888882",
            email: "lucas.admin@email.com",
            role: "ADMIN",
          },
        ]);
        console.log("Users seeded successfully.");
      }

      // 2. Seed Categories
      const catCount = await CategoryModel.countDocuments().exec();
      if (catCount === 0) {
        console.log("Seeding default categories...");
        await CategoryModel.create([
          { name: "Vestuário" },
          { name: "Livros" },
          { name: "Acessórios" },
          { name: "Alimentação" },
          { name: "Outros" },
        ]);
        console.log("Categories seeded successfully.");
      }

      // Get category references
      const vestuarioCat = await CategoryModel.findOne({ name: "Vestuário" });
      const livrosCat = await CategoryModel.findOne({ name: "Livros" });
      const acessoriosCat = await CategoryModel.findOne({ name: "Acessórios" });
      const outrosCat = await CategoryModel.findOne({ name: "Outros" });

      // 3. Seed Active Event
      const eventCount = await EventModel.countDocuments().exec();
      if (eventCount === 0) {
        console.log("Seeding default event...");
        await EventModel.create({
          name: "Homens de Fé - Versão 3",
          isActive: true,
        });
        console.log("Default event seeded.");
      }

      // 4. Seed Products
      const productCount = await ProductModel.countDocuments().exec();
      if (productCount === 0) {
        console.log("Seeding default products...");
        await ProductModel.create([
          {
            name: "Camiseta Oficial Retiro",
            price: 60.0,
            stock: 50,
            imageUrl: "",
            active: true,
            categoryRef: vestuarioCat?._id || outrosCat?._id,
            minStock: 5,
          },
          {
            name: "Bíblia de Estudos Nova",
            price: 120.0,
            stock: 15,
            imageUrl: "",
            active: true,
            categoryRef: livrosCat?._id || outrosCat?._id,
            minStock: 5,
          },
          {
            name: "Garrafa Térmica Homens de Fé",
            price: 45.0,
            stock: 4,
            imageUrl: "",
            active: true,
            categoryRef: acessoriosCat?._id || outrosCat?._id,
            minStock: 5,
          },
        ]);
        console.log("Default products seeded.");
      }
    } catch (err) {
      console.error("Error seeding database:", err);
    }
  }
}
