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
        }
        else {
            user.role = "ADMIN";
            await user.save();
            console.log(`🎉 Sucesso! O usuário ${user.firstName} ${user.lastName} agora é ADMIN.`);
        }
        console.log("=============================================\n");
    }
    catch (error) {
        console.error("❌ Falha na operação:", error);
    }
    finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
makeAdmin();
//# sourceMappingURL=make-admin.js.map