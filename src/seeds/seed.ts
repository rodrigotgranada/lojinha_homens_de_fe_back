import mongoose, { Types } from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

import { UserSchema } from "../schemas/user.schema";
import { ProductSchema } from "../schemas/product.schema";
import { EventSchema } from "../schemas/event.schema";
import { CategorySchema } from "../schemas/category.schema";
import { ExpenseSchema } from "../schemas/expense.schema";
import { EventIncomeSchema } from "../schemas/event-income.schema";
import { SaleSchema } from "../schemas/sale.schema";
import { LogSchema } from "../schemas/log.schema";

const isClean = process.argv.includes("--clean");

async function runSeed() {
  const useLocalDb = process.env.USE_LOCAL_DB === "true";
  const localUri = process.env.MONGODB_URI_LOCAL || "mongodb://localhost:27017/lojinha";
  const cloudUri = process.env.MONGODB_URI_CLOUD || process.env.MONGODB_URI;
  const mongoUri = useLocalDb ? localUri : (cloudUri || localUri);

  console.log(`\n======================================================`);
  console.log(`🌱 [SEED RUNNER] Conectando em: ${mongoUri}`);
  console.log(`======================================================\n`);

  await mongoose.connect(mongoUri);

  const UserModel = mongoose.model("User", UserSchema);
  const ProductModel = mongoose.model("Product", ProductSchema);
  const EventModel = mongoose.model("Event", EventSchema);
  const CategoryModel = mongoose.model("Category", CategorySchema);
  const ExpenseModel = mongoose.model("Expense", ExpenseSchema);
  const EventIncomeModel = mongoose.model("EventIncome", EventIncomeSchema);
  const SaleModel = mongoose.model("Sale", SaleSchema);
  const LogModel = mongoose.model("Log", LogSchema);

  // 1. Limpeza total de coleções
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
  ]);
  console.log("✨ Banco de dados limpo com sucesso.");

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

    await mongoose.disconnect();
    process.exit(0);
  }

  console.log("\n📦 Inserindo dados realistas para testes manuais de ponta a ponta...");

  // 2. Inserir Categorias
  const categories = await CategoryModel.insertMany([
    { name: "Vestuário" },
    { name: "Livros & Bíblias" },
    { name: "Acessórios" },
    { name: "Alimentação & Bebidas" },
    { name: "Outros" },
  ]);
  const [vestuarioCat, livrosCat, acessoriosCat, alimentacaoCat] = categories;
  console.log(`✔️ ${categories.length} Categorias cadastradas.`);

  // 3. Inserir Usuários (Admins, Voluntários e Participantes)
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

  // 4. Inserir Eventos (Retiro Passado ENCERRADO de 2025 vs Retiro Atual ATIVO de 2026)
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

  // 5. Inserir Produtos no Evento Passado (2025) com Estoque Restante (Sobras para Importar)
  const prevProducts = await ProductModel.insertMany([
    {
      name: "Camiseta Oficial Retiro 2025",
      price: 65.0,
      costPrice: 32.0,
      stock: 15, // Sobra de 15 unidades que sobrou do evento passado
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
      stock: 8, // Sobra de 8 unidades
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
      stock: 10, // Sobra de 10 unidades
      initialStock: 50,
      sponsorName: "Patrocínio Comercial",
      categoryRef: acessoriosCat._id,
      eventId: previousEvent._id,
      active: true,
      minStock: 5,
    },
  ]);
  console.log(`✔️ ${prevProducts.length} Produtos com sobras cadastrados no evento anterior (2025).`);

  // 6. Inserir Produtos no Evento Atual (2026) Prontos para Testar Importação
  const currentProducts = await ProductModel.insertMany([
    {
      name: "Camiseta Oficial Retiro 2026 (Branca/Azul)",
      price: 70.0,
      costPrice: 35.0,
      stock: 50,
      initialStock: 50,
      sponsorName: "Doação Gráfica Esperança",
      isDonation: true, // DOAÇÃO - Não gera reembolso
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
      isDonation: false, // Investimento de R$ 180,00 a ser devolvido com as vendas
      categoryRef: acessoriosCat._id,
      eventId: currentEvent._id,
      active: true,
      minStock: 10,
    },
  ]);
  console.log(`✔️ ${currentProducts.length} Produtos cadastrados no evento atual (2026).`);

  // 7. Despesas de Infraestrutura e Operacionais nos 2 Eventos
  // a) Despesas do Evento Passado (2025)
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
        _id: new Types.ObjectId(),
        description: "Fogão Industrial de 4 Bocas com Forno",
        amount: 1800.0,
        paidBy: "Gabriel Admin",
        payerPhone: "53988888881",
        isDonation: true, // DOAÇÃO - R$ 0 reembolso
        status: "DOACAO",
        repaidAmount: 0.0,
        notes: "Fogão doado pelo Gabriel Admin para o retiro (sem reembolso)",
        repaymentHistory: [],
      },
      {
        _id: new Types.ObjectId(),
        description: "Tintas e Pincéis para Reforma da Cozinha",
        amount: 600.0,
        paidBy: "Gabriel Admin",
        payerPhone: "53988888881",
        isDonation: false,
        status: "REEMBOLSADO",
        repaidAmount: 600.0,
        repaymentHistory: [
          {
            _id: new Types.ObjectId(),
            amount: 600.0,
            date: new Date("2025-10-12"),
            method: "PIX",
            operatorName: "Lucas Admin",
          },
        ],
      },
    ],
  });

  // b) Despesas do Evento Atual (2026)
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
        _id: new Types.ObjectId(),
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
        _id: new Types.ObjectId(),
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

  // 8. Receitas Extras (Inscrições, Rifa, Doações)
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

  // 9. Vendas no PDV no Evento Atual
  await SaleModel.insertMany([
    {
      customerId: clienteFelipe._id,
      eventId: currentEvent._id,
      totalPrice: 115.0,
      status: "PAGO",
      items: [
        {
          productId: currentProducts[0]._id, // Camiseta 2026 (70,00)
          quantity: 1,
          priceAtPurchase: 70.0,
        },
        {
          productId: currentProducts[1]._id, // Boné (45,00)
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
      status: "PENDENTE", // Fiado
      items: [
        {
          productId: currentProducts[2]._id, // Livro (40,00)
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

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Erro fatal ao rodar seed:", err);
  process.exit(1);
});
