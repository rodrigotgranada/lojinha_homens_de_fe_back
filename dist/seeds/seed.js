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
const mongoose_1 = __importStar(require("mongoose"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const user_schema_1 = require("../schemas/user.schema");
const product_schema_1 = require("../schemas/product.schema");
const event_schema_1 = require("../schemas/event.schema");
const category_schema_1 = require("../schemas/category.schema");
const expense_schema_1 = require("../schemas/expense.schema");
const event_income_schema_1 = require("../schemas/event-income.schema");
const sale_schema_1 = require("../schemas/sale.schema");
const log_schema_1 = require("../schemas/log.schema");
const stock_entry_schema_1 = require("../schemas/stock-entry.schema");
const payment_config_schema_1 = require("../schemas/payment-config.schema");
const isClean = process.argv.includes("--clean");
async function runSeed() {
    const useLocalDb = process.env.USE_LOCAL_DB === "true";
    const localUri = process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/lojinha";
    const cloudUri = process.env.MONGODB_URI_CLOUD || process.env.MONGODB_URI;
    const mongoUri = useLocalDb ? localUri : (cloudUri || localUri);
    console.log(`\n======================================================`);
    console.log(`🌱 [SEED RUNNER] Conectando em: ${mongoUri}`);
    console.log(`======================================================\n`);
    await mongoose_1.default.connect(mongoUri);
    const UserModel = mongoose_1.default.model("User", user_schema_1.UserSchema);
    const ProductModel = mongoose_1.default.model("Product", product_schema_1.ProductSchema);
    const EventModel = mongoose_1.default.model("Event", event_schema_1.EventSchema);
    const CategoryModel = mongoose_1.default.model("Category", category_schema_1.CategorySchema);
    const ExpenseModel = mongoose_1.default.model("Expense", expense_schema_1.ExpenseSchema);
    const EventIncomeModel = mongoose_1.default.model("EventIncome", event_income_schema_1.EventIncomeSchema);
    const SaleModel = mongoose_1.default.model("Sale", sale_schema_1.SaleSchema);
    const LogModel = mongoose_1.default.model("Log", log_schema_1.LogSchema);
    const StockEntryModel = mongoose_1.default.model("StockEntry", stock_entry_schema_1.StockEntrySchema);
    const PaymentConfigModel = mongoose_1.default.model("PaymentConfig", payment_config_schema_1.PaymentConfigSchema);
    console.log("🧹 Limpando dados das coleções...");
    await Promise.all([
        UserModel.deleteMany({}),
        ProductModel.deleteMany({}),
        EventModel.deleteMany({}),
        CategoryModel.deleteMany({}),
        ExpenseModel.deleteMany({}),
        EventIncomeModel.deleteMany({}),
        SaleModel.deleteMany({}),
        LogModel.deleteMany({}),
        StockEntryModel.deleteMany({}),
        PaymentConfigModel.deleteMany({}),
    ]);
    console.log("✨ Banco de dados limpo com sucesso.");
    await PaymentConfigModel.create({
        pixKey: "homensdefe.pel@gmail.com",
        keyType: "EMAIL",
        merchantName: "Alcides",
        bankName: "Nubank",
        city: "Pelotas",
        description: "Chave Oficial do Retiro",
        isDefault: true,
        active: true,
    });
    if (isClean) {
        console.log("\n👤 Cadastrando os 3 Administradores padrão e estrutura inicial...");
        await UserModel.insertMany([
            {
                cpf: "11111111111",
                firstName: "Gabriel",
                lastName: "Admin",
                phone: "53111111111",
                email: "gabriel.admin@homensdefe.com",
                role: "ADMIN",
                active: true,
            },
            {
                cpf: "22222222222",
                firstName: "Lucas",
                lastName: "Admin",
                phone: "53222222222",
                email: "lucas.admin@homensdefe.com",
                role: "ADMIN",
                active: true,
            },
            {
                cpf: "01268836028",
                firstName: "Rodrigo",
                lastName: "Granada",
                phone: "53999429996",
                email: "rodrigo.granada@homensdefe.com",
                role: "ADMIN",
                active: true,
            },
        ]);
        await EventModel.create({
            name: "Retiro Homens de Fé 2026",
            status: "ATIVO",
            isActive: true,
            startDate: "2026-10-08",
            endDate: "2026-10-11",
        });
        await CategoryModel.insertMany([
            { name: "Vestuário" },
            { name: "Livros & Bíblias" },
            { name: "Acessórios" },
            { name: "Alimentação & Bebidas" },
            { name: "Outros" },
        ]);
        console.log("\n=======================================================");
        console.log("🎉 BANCO DE DADOS ZERADO E PRONTO PARA PRODUÇÃO!");
        console.log("   - Produtos: 0 (Vazio)");
        console.log("   - Vendas / PDV: 0 (Vazio)");
        console.log("   - Despesas & Obras: 0 (Vazio)");
        console.log("   - Receitas Extras: 0 (Vazio)");
        console.log("   - Usuários: 3 Administradores cadastrados");
        console.log("   - Evento Ativo: Retiro Homens de Fé 2026");
        console.log("=======================================================\n");
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    console.log("\n📦 Inserindo dados realistas para testes manuais de ponta a ponta...");
    const categories = await CategoryModel.insertMany([
        { name: "Vestuário" },
        { name: "Livros & Bíblias" },
        { name: "Acessórios" },
        { name: "Alimentação & Bebidas" },
        { name: "Outros" },
    ]);
    const [vestuarioCat, livrosCat, acessoriosCat, alimentacaoCat] = categories;
    console.log(`✔️ ${categories.length} Categorias cadastradas.`);
    const users = await UserModel.insertMany([
        {
            cpf: "11111111111",
            firstName: "Gabriel",
            lastName: "Admin",
            phone: "53111111111",
            email: "gabriel.admin@email.com",
            role: "ADMIN",
            active: true,
        },
        {
            cpf: "22222222222",
            firstName: "Lucas",
            lastName: "Admin",
            phone: "53222222222",
            email: "lucas.admin@email.com",
            role: "ADMIN",
            active: true,
        },
        {
            cpf: "01268836028",
            firstName: "Rodrigo",
            lastName: "Granada",
            phone: "53999429996",
            email: "rodrigo.granada@homensdefe.com",
            role: "ADMIN",
            active: true,
        },
        {
            cpf: "33333333333",
            firstName: "Carlos",
            lastName: "Eduardo (Voluntário Obras)",
            phone: "51999993333",
            email: "carlos.obras@igreja.com",
            role: "ADMIN",
            active: true,
        },
        {
            cpf: "44444444444",
            firstName: "Felipe",
            lastName: "Santos (Participante)",
            phone: "51999994444",
            email: "felipe.participante@gmail.com",
            role: "USER",
            active: true,
        },
        {
            cpf: "55555555555",
            firstName: "Bruno",
            lastName: "Silva (Participante)",
            phone: "51999995555",
            email: "bruno.silva@gmail.com",
            role: "USER",
            active: true,
        },
    ]);
    const [adminGabriel, adminLucas, voluntarioCarlos, clienteFelipe, clienteBruno] = users;
    console.log(`✔️ ${users.length} Usuários cadastrados.`);
    const previousEvent = await EventModel.create({
        name: "Retiro Homens de Fé 2025 (Edição Anterior - Finalizado)",
        status: "ENCERRADO",
        isActive: false,
        location: "Sítio Recanto da Paz",
        startDate: "2025-10-10",
        endDate: "2025-10-12",
    });
    const currentEvent = await EventModel.create({
        name: "Retiro Homens de Fé 2026 (Edição Atual - Em Aberto)",
        status: "ATIVO",
        isActive: true,
        location: "Sítio Vale das Águas",
        startDate: "2026-10-08",
        endDate: "2026-10-11",
    });
    console.log(`✔️ 2 Eventos cadastrados (2025 Encerrado e 2026 Ativo).`);
    const prevProducts = await ProductModel.insertMany([
        {
            name: "Camiseta Oficial Retiro 2025",
            price: 65.0,
            costPrice: 32.0,
            stock: 15,
            initialStock: 80,
            sponsorName: "Doação Irmão Roberto",
            categoryRef: vestuarioCat._id,
            eventId: previousEvent._id,
            active: true,
            minStock: 5,
        },
        {
            name: "Bíblia de Estudos Homens de Fé (Capa Couro)",
            price: 130.0,
            costPrice: 75.0,
            stock: 8,
            initialStock: 30,
            sponsorName: "",
            categoryRef: livrosCat._id,
            eventId: previousEvent._id,
            active: true,
            minStock: 3,
        },
        {
            name: "Garrafa Térmica Inox 750ml",
            price: 55.0,
            costPrice: 24.0,
            stock: 10,
            initialStock: 50,
            sponsorName: "Patrocínio Comercial",
            categoryRef: acessoriosCat._id,
            eventId: previousEvent._id,
            active: true,
            minStock: 5,
        },
    ]);
    console.log(`✔️ ${prevProducts.length} Produtos com sobras cadastrados no evento anterior (2025).`);
    const currentProducts = await ProductModel.insertMany([
        {
            name: "Camiseta Oficial Retiro 2026 (Branca/Azul)",
            price: 70.0,
            costPrice: 35.0,
            stock: 50,
            initialStock: 50,
            sponsorName: "Doação Gráfica Esperança",
            isDonation: true,
            categoryRef: vestuarioCat._id,
            eventId: currentEvent._id,
            active: true,
            minStock: 10,
        },
        {
            name: "Boné Bordado Homens de Fé",
            price: 45.0,
            costPrice: 20.0,
            stock: 30,
            initialStock: 30,
            sponsorName: "",
            isDonation: false,
            categoryRef: vestuarioCat._id,
            eventId: currentEvent._id,
            active: true,
            minStock: 5,
        },
        {
            name: "Livro: A Jornada do Homem de Oração",
            price: 40.0,
            costPrice: 18.0,
            stock: 20,
            initialStock: 20,
            sponsorName: "",
            isDonation: false,
            categoryRef: livrosCat._id,
            eventId: currentEvent._id,
            active: true,
            minStock: 5,
        },
        {
            name: "Chaveiro Resinado Cruz de Metal",
            price: 15.0,
            costPrice: 4.5,
            stock: 40,
            initialStock: 40,
            sponsorName: "Irmã Maria",
            isDonation: false,
            categoryRef: acessoriosCat._id,
            eventId: currentEvent._id,
            active: true,
            minStock: 10,
        },
    ]);
    console.log(`✔️ ${currentProducts.length} Produtos cadastrados no evento atual (2026).`);
    await StockEntryModel.insertMany([
        {
            productId: currentProducts[0]._id,
            eventId: currentEvent._id,
            quantity: 50,
            costPrice: 35.0,
            totalCost: 1750.0,
            sponsorName: "Doação Gráfica Esperança",
            isDonation: true,
            notes: "Doação integral de camisetas para a comunidade",
            operatorName: "Admin",
        },
        {
            productId: currentProducts[1]._id,
            eventId: currentEvent._id,
            quantity: 15,
            costPrice: 20.0,
            totalCost: 300.0,
            sponsorName: "Irmão Carlos",
            isDonation: false,
            notes: "Metade do lote de bonés financiado pelo Carlos",
            operatorName: "Admin",
        },
        {
            productId: currentProducts[1]._id,
            eventId: currentEvent._id,
            quantity: 15,
            costPrice: 20.0,
            totalCost: 300.0,
            sponsorName: "Irmão Marcos",
            isDonation: false,
            notes: "Segunda metade do lote financiado pelo Marcos",
            operatorName: "Admin",
        },
        {
            productId: currentProducts[3]._id,
            eventId: currentEvent._id,
            quantity: 40,
            costPrice: 4.5,
            totalCost: 180.0,
            sponsorName: "Irmã Maria",
            isDonation: false,
            notes: "Lote de chaveiros de metal resinado",
            operatorName: "Admin",
        },
    ]);
    console.log(`✔️ Lotes de Entradas de Estoque (StockEntries) cadastrados.`);
    await ExpenseModel.create({
        eventId: previousEvent._id,
        title: "Benfeitorias e Infraestrutura Retiro 2025",
        category: "OBRA",
        nature: "INFRAESTRUTURA",
        description: "Estrutura do rancho e equipamentos da cozinha",
        totalAmount: 2400.0,
        totalRepaid: 600.0,
        items: [
            {
                _id: new mongoose_1.Types.ObjectId(),
                description: "Fogão Industrial de 4 Bocas com Forno",
                amount: 1800.0,
                paidBy: "Gabriel Admin",
                payerPhone: "53988888881",
                isDonation: true,
                status: "DOACAO",
                repaidAmount: 0.0,
                notes: "Fogão doado pelo Gabriel Admin para o retiro (sem reembolso)",
                repaymentHistory: [],
            },
            {
                _id: new mongoose_1.Types.ObjectId(),
                description: "Tintas e Pincéis para Reforma da Cozinha",
                amount: 600.0,
                paidBy: "Gabriel Admin",
                payerPhone: "53988888881",
                isDonation: false,
                status: "REEMBOLSADO",
                repaidAmount: 600.0,
                repaymentHistory: [
                    {
                        _id: new mongoose_1.Types.ObjectId(),
                        amount: 600.0,
                        date: new Date("2025-10-12"),
                        method: "PIX",
                        operatorName: "Lucas Admin",
                    },
                ],
            },
        ],
    });
    await ExpenseModel.create({
        eventId: currentEvent._id,
        title: "Obras e Infraestrutura da Casa Central (Retiro 2026)",
        category: "OBRA",
        nature: "INFRAESTRUTURA",
        description: "Reforma do piso e pintura externa",
        totalAmount: 1600.0,
        totalRepaid: 0.0,
        items: [
            {
                _id: new mongoose_1.Types.ObjectId(),
                description: "Piso Cerâmico e Argamassa da Casa Central",
                amount: 1000.0,
                paidBy: "Gabriel Admin",
                payerPhone: "53988888881",
                isDonation: false,
                status: "PENDENTE",
                repaidAmount: 0.0,
                notes: "Piso comprado por Gabriel Admin. Aguardando reembolso após o evento.",
                repaymentHistory: [],
            },
            {
                _id: new mongoose_1.Types.ObjectId(),
                description: "Pintura Externa da Casa Central",
                amount: 600.0,
                paidBy: "Lucas Admin",
                payerPhone: "53988888882",
                isDonation: false,
                status: "PENDENTE",
                repaidAmount: 0.0,
                notes: "Tintas compradas por Lucas Admin.",
                repaymentHistory: [],
            },
        ],
    });
    console.log(`✔️ Despesas de Infraestrutura/Obras cadastradas para ambos os eventos.`);
    await EventIncomeModel.insertMany([
        {
            eventId: currentEvent._id,
            title: "Inscrições do Retiro 2026 - 1º Lote (40 Participantes)",
            type: "INSCRICOES",
            amount: 4800.0,
            notes: "40 inscrições pagas via Pix para a conta oficial",
        },
        {
            eventId: currentEvent._id,
            title: "Rifa Beneficente Pré-Retiro",
            type: "RIFA",
            amount: 1200.0,
            notes: "Arrecadação da rifa beneficente",
        },
    ]);
    console.log(`✔️ Receitas extras cadastradas.`);
    await SaleModel.insertMany([
        {
            customerId: clienteFelipe._id,
            eventId: currentEvent._id,
            totalPrice: 115.0,
            status: "PAGO",
            items: [
                {
                    productId: currentProducts[0]._id,
                    quantity: 1,
                    priceAtPurchase: 70.0,
                },
                {
                    productId: currentProducts[1]._id,
                    quantity: 1,
                    priceAtPurchase: 45.0,
                },
            ],
            operatorId: adminGabriel.id,
            createdAt: new Date(),
        },
        {
            customerId: clienteBruno._id,
            eventId: currentEvent._id,
            totalPrice: 40.0,
            status: "PENDENTE",
            items: [
                {
                    productId: currentProducts[2]._id,
                    quantity: 1,
                    priceAtPurchase: 40.0,
                },
            ],
            operatorId: adminGabriel.id,
            createdAt: new Date(),
        },
    ]);
    console.log(`✔️ Vendas de teste no PDV salvas.`);
    console.log(`\n======================================================`);
    console.log(`🎉 [SEED DE TESTES MANUAIS CONCLUÍDO COM SUCESSO!]`);
    console.log(`======================================================`);
    console.log(`👤 Gabriel Admin (CPF: 11111111111 | Senha: 53111111111)`);
    console.log(`👤 Lucas Admin (CPF: 22222222222 | Senha: 53222222222)`);
    console.log(`👤 Rodrigo Granada (CPF: 01268836028 | Senha: 53999429996)`);
    console.log(`🏆 Evento Ativo (Em Aberto): "Retiro Homens de Fé 2026"`);
    console.log(`📦 Evento Passado (Finalizado): "Retiro Homens de Fé 2025"`);
    console.log(`======================================================\n`);
    await mongoose_1.default.disconnect();
    process.exit(0);
}
runSeed().catch((err) => {
    console.error("❌ Erro fatal ao rodar seed:", err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map