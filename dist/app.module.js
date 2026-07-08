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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const firebase_module_1 = require("./firebase/firebase.module");
const firebase_service_1 = require("./firebase/firebase.service");
const websocket_module_1 = require("./websocket/websocket.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const sales_module_1 = require("./sales/sales.module");
const events_module_1 = require("./events/events.module");
const logs_module_1 = require("./logs/logs.module");
const categories_module_1 = require("./categories/categories.module");
let AppModule = class AppModule {
    connection;
    firebaseService;
    constructor(connection, firebaseService) {
        this.connection = connection;
        this.firebaseService = firebaseService;
    }
    async onApplicationBootstrap() {
        console.log("\n=================================");
        if (this.connection.readyState === 1) {
            console.log("\x1b[32m%s\x1b[0m", "MONGO CONNECTED");
            await this.seedDatabase();
        }
        else {
            console.log("\x1b[31m%s\x1b[0m", "MONGO NOT CONNECTED");
        }
        if (this.firebaseService.isConnected()) {
            console.log("\x1b[32m%s\x1b[0m", "STORAGE CONNECTED");
        }
        else {
            console.log("\x1b[33m%s\x1b[0m", "STORAGE RUNNING LOCALLY (FALLBACK)");
        }
        console.log("=================================\n");
    }
    async seedDatabase() {
        try {
            const UserModel = this.connection.model("User");
            const ProductModel = this.connection.model("Product");
            const EventModel = this.connection.model("Event");
            const CategoryModel = this.connection.model("Category");
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
            const vestuarioCat = await CategoryModel.findOne({ name: "Vestuário" });
            const livrosCat = await CategoryModel.findOne({ name: "Livros" });
            const acessoriosCat = await CategoryModel.findOne({ name: "Acessórios" });
            const outrosCat = await CategoryModel.findOne({ name: "Outros" });
            const eventCount = await EventModel.countDocuments().exec();
            if (eventCount === 0) {
                console.log("Seeding default event...");
                await EventModel.create({
                    name: "Homens de Fé - Versão 3",
                    isActive: true,
                });
                console.log("Default event seeded.");
            }
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
        }
        catch (err) {
            console.error("Error seeding database:", err);
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env",
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    uri: configService.get("MONGODB_URI") || "mongodb://localhost:27017/lojinha",
                }),
                inject: [config_1.ConfigService],
            }),
            firebase_module_1.FirebaseModule,
            websocket_module_1.WebsocketModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            sales_module_1.SalesModule,
            events_module_1.EventsModule,
            logs_module_1.LogsModule,
            categories_module_1.CategoriesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    }),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection,
        firebase_service_1.FirebaseService])
], AppModule);
//# sourceMappingURL=app.module.js.map