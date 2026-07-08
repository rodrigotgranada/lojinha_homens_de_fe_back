import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as dns from "dns";

// Force Node.js to use Google and Cloudflare DNS to fix querySrv DNS issues on some ISPs
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load environment variables from backend/.env
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
        } catch (err) {
          console.warn(`Could not drop collection ${col.name}:`, (err as Error).message);
        }
      }
    }

    // 1. Create Categories
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

    // 2. Create Users
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

    // 3. Create Event
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

    // 4. Create Products
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
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
