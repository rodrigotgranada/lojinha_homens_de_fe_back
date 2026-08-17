import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as dns from "dns";

// Force Node.js to use Google and Cloudflare DNS to avoid SRV query issues
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, "../.env") });

const useLocal = process.env.USE_LOCAL_DB === "true";
const MONGODB_URI = useLocal
  ? (process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/lojinha")
  : (process.env.MONGODB_URI_CLOUD || process.env.MONGODB_URI || "mongodb://localhost:27017/lojinha");

async function cleanDatabase() {
  console.log("\n=======================================================");
  console.log("🧹 INICIANDO LIMPEZA COMPLETA DO BANCO DE DADOS");
  console.log("🌐 Ambiente:", useLocal ? "LOCAL (mongodb://localhost:27017/lojinha)" : "NUVEM (MongoDB Atlas)");
  console.log("=======================================================\n");

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado com sucesso ao MongoDB!");

    const db = conn.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log(`\n🗑️ Removendo ${collections.length} coleções existentes...`);
      for (const col of collections) {
        try {
          await db.dropCollection(col.name);
          console.log(`   - Coleção removida: [ ${col.name} ]`);
        } catch (err) {
          console.warn(`   ⚠️ Não foi possível remover [ ${col.name} ]:`, (err as Error).message);
        }
      }
    }

    // 1. Cadastrar os 3 Administradores
    console.log("\n👤 Criando os 3 Usuários Administradores...");
    const UserSchema = new mongoose.Schema({
      cpf: { type: String, unique: true, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      role: { type: String, default: "USER" },
    });
    const UserModel = mongoose.model("User", UserSchema);

    const adminUsers = await UserModel.create([
      {
        cpf: "11111111111",
        firstName: "Gabriel",
        lastName: "Admin",
        phone: "(53) 98888-8881",
        email: "gabriel.admin@homensdefe.com",
        role: "ADMIN",
      },
      {
        cpf: "22222222222",
        firstName: "Lucas",
        lastName: "Admin",
        phone: "(53) 98888-8882",
        email: "lucas.admin@homensdefe.com",
        role: "ADMIN",
      },
      {
        cpf: "01268836028",
        firstName: "Rodrigo",
        lastName: "Granada",
        phone: "53999429996",
        email: "rodrigo.granada@homensdefe.com",
        role: "ADMIN",
      },
    ]);

    console.log("✅ 3 Administradores criados com sucesso:");
    adminUsers.forEach((u) => {
      console.log(`   👉 ${u.firstName} ${u.lastName} | CPF: ${u.cpf} | Role: ${u.role}`);
    });

    // 2. Criar Evento Inicial Ativo
    console.log("\n📅 Criando Evento Padrão Ativo...");
    const EventSchema = new mongoose.Schema({
      name: { type: String, required: true },
      isActive: { type: Boolean, default: true },
    });
    const EventModel = mongoose.model("Event", EventSchema);

    const event = await EventModel.create({
      name: "Retiro Homens de Fé 2026",
      isActive: true,
    });
    console.log(`✅ Evento criado: "${event.name}" (ID: ${event._id})`);

    // 3. Criar Categorias Base para a Lojinha
    console.log("\n🏷️ Criando Categorias Base...");
    const CategorySchema = new mongoose.Schema({
      name: { type: String, required: true },
      active: { type: Boolean, default: true },
    });
    const CategoryModel = mongoose.model("Category", CategorySchema);

    const categories = await CategoryModel.create([
      { name: "Vestuário" },
      { name: "Acessórios" },
      { name: "Artigos Religiosos" },
      { name: "Livros" },
      { name: "Outros" },
    ]);
    console.log(`✅ ${categories.length} categorias cadastradas.`);

    console.log("\n=======================================================");
    console.log("🎉 BANCO DE DADOS LIMPO E PRONTO PARA TESTES!");
    console.log("   - Produtos: 0 (Vazio)");
    console.log("   - Vendas PDV: 0 (Vazio)");
    console.log("   - Despesas & Obras: 0 (Vazio)");
    console.log("   - Receitas Extras: 0 (Vazio)");
    console.log("   - Usuários: 3 Administradores cadastrados");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Falha ao limpar o banco:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanDatabase();
