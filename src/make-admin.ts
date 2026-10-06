import * as mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as dns from "dns";

// Força o Node.js a usar Google e Cloudflare DNS para evitar problemas de querySrv
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/lojinha";

async function makeAdmin() {
  const cpfToAdmin = process.argv[2];

  if (!cpfToAdmin) {
    console.error("❌ Por favor, forneça o CPF do usuário. Exemplo: npx ts-node src/make-admin.ts 12345678900");
    process.exit(1);
  }

  const cleanCpf = cpfToAdmin.replace(/\D/g, "");

  console.log(`\n=============================================`);
  console.log(`Conectando ao banco de dados: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado com sucesso.");

    const UserSchema = new mongoose.Schema({
      cpf: { type: String, unique: true, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      role: { type: String, default: "USER" },
    });
    const UserModel = mongoose.model("User", UserSchema);

    const user = await UserModel.findOne({ cpf: cleanCpf });

    if (!user) {
      console.error(`❌ Usuário com CPF ${cleanCpf} não encontrado no sistema.`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`⚠️  O usuário ${user.firstName} ${user.lastName} já é ADMIN.`);
    } else {
      user.role = "ADMIN";
      await user.save();
      console.log(`🎉 Sucesso! O usuário ${user.firstName} ${user.lastName} agora é ADMIN.`);
    }

    console.log("=============================================\n");
  } catch (error) {
    console.error("❌ Falha na operação:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
