"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const dns = __importStar(require("dns"));
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config({ path: path.join(__dirname, "../.env") });
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lojinha";
async function seed() {
    console.log("\n=============================================");
    console.log("Connecting to MongoDB:", MONGODB_URI);
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully to Database.");
        const db = conn.connection.db;
        if (db) {
            const collections = await db.listCollections().toArray();
            console.log("Dropping existing collections to reset database...");
            for (const col of collections) {
                try {
                    await db.dropCollection(col.name);
                    console.log(`Dropped collection: ${col.name}`);
                }
                catch (err) {
                    console.warn(`Could not drop collection ${col.name}:`, err.message);
                }
            }
        }
        console.log("Creating categories...");
        const CategorySchema = new mongoose.Schema({
            name: { type: String, required: true },
            active: { type: Boolean, default: true }
        });
        const CategoryModel = mongoose.model("Category", CategorySchema);
        const categories = await CategoryModel.create([
            { name: "Vestuário" },
            { name: "Livros" },
            { name: "Acessórios" },
            { name: "Alimentação" },
            { name: "Outros" },
        ]);
        console.log(`Seeded ${categories.length} categories.`);
        const vestuarioCat = categories.find((c) => c.name === "Vestuário");
        const livrosCat = categories.find((c) => c.name === "Livros");
        const acessoriosCat = categories.find((c) => c.name === "Acessórios");
        const outrosCat = categories.find((c) => c.name === "Outros");
        console.log("Creating users...");
        const UserSchema = new mongoose.Schema({
            cpf: { type: String, unique: true, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            phone: { type: String, required: true },
            email: String,
            role: { type: String, default: "USER" },
        });
        const UserModel = mongoose.model("User", UserSchema);
        const users = await UserModel.create([
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
        console.log(`Seeded ${users.length} users.`);
        console.log("Creating active event...");
        const EventSchema = new mongoose.Schema({
            name: { type: String, required: true },
            isActive: { type: Boolean, default: true }
        });
        const EventModel = mongoose.model("Event", EventSchema);
        await EventModel.create({
            name: "Homens de Fé - Versão 3",
            isActive: true,
        });
        console.log("Active event seeded.");
        console.log("Creating products...");
        const ProductSchema = new mongoose.Schema({
            name: { type: String, required: true },
            price: { type: Number, required: true },
            stock: { type: Number, required: true },
            imageUrl: { type: String, default: "" },
            active: { type: Boolean, default: true },
            categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
            minStock: { type: Number, default: 5 },
        });
        const ProductModel = mongoose.model("Product", ProductSchema);
        const products = await ProductModel.create([
            {
                name: "Camiseta Oficial Retiro",
                price: 60.00,
                stock: 50,
                imageUrl: "",
                active: true,
                categoryRef: vestuarioCat?._id || outrosCat?._id,
                minStock: 5,
            },
            {
                name: "Bíblia de Estudos Nova",
                price: 120.00,
                stock: 15,
                imageUrl: "",
                active: true,
                categoryRef: livrosCat?._id || outrosCat?._id,
                minStock: 5,
            },
            {
                name: "Garrafa Térmica Homens de Fé",
                price: 45.00,
                stock: 4,
                imageUrl: "",
                active: true,
                categoryRef: acessoriosCat?._id || outrosCat?._id,
                minStock: 5,
            },
        ]);
        console.log(`Seeded ${products.length} products.`);
        console.log("=============================================");
        console.log("DATABASE RESET AND SEED COMPLETED SUCCESSFULLY!");
        console.log("=============================================\n");
    }
    catch (error) {
        console.error("Seeding failed:", error);
    }
    finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
seed();
//# sourceMappingURL=seed.js.map