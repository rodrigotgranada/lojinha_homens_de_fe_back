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
    console.log("\n✅ Modo --clean concluído. Banco de dados zerado.");
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log("\n📦 Inserindo dados realistas para testes de ponta a ponta...");

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
      firstName: "Rodrigo",
      lastName: "Granada (Admin)",
      phone: "51999991111",
      email: "rodrigo.admin@lojinha.com",
      role: "ADMIN",
      active: true,
    },
    {
      cpf: "22222222222",
      firstName: "Carlos",
      lastName: "Eduardo (Voluntário Obras)",
      phone: "51999992222",
      email: "carlos.obras@igreja.com",
      role: "ADMIN",
      active: true,
    },
    {
      cpf: "33333333333",
      firstName: "Mateus",
      lastName: "Oliveira (Voluntário Cozinha)",
      phone: "51999993333",
      email: "mateus.cozinha@igreja.com",
      role: "USER",
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
    {
      cpf: "66666666666",
      firstName: "Lucas",
      lastName: "Mendes (Participante Inativo)",
      phone: "51999996666",
      email: "lucas.inativo@gmail.com",
      role: "USER",
      active: false,
    },
  ]);
  const [adminRodrigo, voluntarioCarlos, voluntarioMateus, clienteFelipe, clienteBruno] = users;
  console.log(`✔️ ${users.length} Usuários cadastrados.`);

  // 4. Inserir Eventos (Retiro Anterior ENCERRADO e Retiro Atual ATIVO)
  const previousEvent = await EventModel.create({
    name: "Retiro Homens de Fé 2025 (Edição Anterior)",
    status: "ENCERRADO",
    isActive: false,
    location: "Sítio Recanto da Paz",
    startDate: "2025-10-10",
    endDate: "2025-10-12",
  });

  const currentEvent = await EventModel.create({
    name: "Retiro Homens de Fé 2026 (Edição Atual)",
    status: "ATIVO",
    isActive: true,
    location: "Sítio Vale das Águas",
    startDate: "2026-11-14",
    endDate: "2026-11-16",
  });
  console.log(`✔️ 2 Eventos cadastrados (2025 Encerrado e 2026 Ativo).`);

  // 5. Inserir Produtos no Evento Anterior (Para testar o módulo de Importação e Conciliação de Sobras)
  const prevProducts = await ProductModel.insertMany([
    {
      name: "Camiseta Oficial Retiro 2025",
      price: 65.0,
      costPrice: 32.0,
      stock: 12, // Sobra de 12 unidades
      initialStock: 80,
      sponsorName: "Patrocínio Empresa Alpha",
      categoryRef: vestuarioCat._id,
      eventId: previousEvent._id,
      active: true,
      minStock: 5,
    },
    {
      name: "Bíblia de Estudos Homens de Fé (Capa Couro)",
      price: 130.0,
      costPrice: 75.0,
      stock: 6, // Sobra de 6 unidades
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
      stock: 8, // Sobra de 8 unidades
      initialStock: 50,
      sponsorName: "Irmão Roberto",
      categoryRef: acessoriosCat._id,
      eventId: previousEvent._id,
      active: true,
      minStock: 5,
    },
  ]);
  console.log(`✔️ ${prevProducts.length} Produtos com sobra cadastrados no evento de 2025.`);

  // 6. Inserir Produtos no Evento Atual (2026)
  const currentProducts = await ProductModel.insertMany([
    {
      name: "Camiseta Oficial Retiro 2026 (Branca/Azul)",
      price: 70.0,
      costPrice: 35.0,
      stock: 60,
      initialStock: 60,
      sponsorName: "Doação Gráfica Esperança",
      categoryRef: vestuarioCat._id,
      eventId: currentEvent._id,
      active: true,
      minStock: 10,
    },
    {
      name: "Boné Bordado Homens de Fé",
      price: 45.0,
      costPrice: 20.0,
      stock: 40,
      initialStock: 40,
      sponsorName: "",
      categoryRef: vestuarioCat._id,
      eventId: currentEvent._id,
      active: true,
      minStock: 5,
    },
    {
      name: "Livro: A Jornada do Homem de Oração",
      price: 40.0,
      costPrice: 18.0,
      stock: 25,
      initialStock: 25,
      sponsorName: "",
      categoryRef: livrosCat._id,
      eventId: currentEvent._id,
      active: true,
      minStock: 5,
    },
    {
      name: "Chaveiro Resinado Cruz de Metal",
      price: 15.0,
      costPrice: 4.5,
      stock: 50,
      initialStock: 50,
      sponsorName: "Irmã Maria",
      categoryRef: acessoriosCat._id,
      eventId: currentEvent._id,
      active: true,
      minStock: 10,
    },
    {
      name: "Café Especial & Cookie Artesanal",
      price: 12.0,
      costPrice: 5.0,
      stock: 80,
      initialStock: 80,
      sponsorName: "",
      categoryRef: alimentacaoCat._id,
      eventId: currentEvent._id,
      active: true,
      minStock: 15,
    },
  ]);
  console.log(`✔️ ${currentProducts.length} Produtos cadastrados no evento de 2026.`);

  // 7. Inserir Despesas & Obras com Itens e Reembolsos Parciais
  await ExpenseModel.insertMany([
    {
      eventId: currentEvent._id,
      title: "Reforma e Elétrica dos Banheiros do Sítio",
      category: "OBRA",
      nature: "INFRAESTRUTURA",
      description: "Instalação de chuveiros 220V e fiação reforçada",
      totalAmount: 470.0,
      totalRepaid: 200.0,
      items: [
        {
          _id: new Types.ObjectId(),
          description: "2 Chuveiros Blindados Fame + Fiação 6mm",
          amount: 320.0,
          paidBy: "Carlos Eduardo (Voluntário Obras)",
          payerPhone: "51999992222",
          isDonation: false,
          status: "REEMBOLSADO_PARCIAL",
          repaidAmount: 200.0,
          repaymentHistory: [
            {
              _id: new Types.ObjectId(),
              amount: 200.0,
              date: new Date(Date.now() - 86400000),
              method: "PIX",
              operatorName: "Rodrigo Granada",
            },
          ],
        },
        {
          _id: new Types.ObjectId(),
          description: "Disjuntores 40A e Caixas de Tomadas",
          amount: 150.0,
          paidBy: "Carlos Eduardo (Voluntário Obras)",
          payerPhone: "51999992222",
          isDonation: false,
          status: "PENDENTE",
          repaidAmount: 0.0,
          repaymentHistory: [],
        },
        {
          _id: new Types.ObjectId(),
          description: "Fitas Isolantes e Lâmpadas LED (Doação)",
          amount: 0.0,
          paidBy: "Carlos Eduardo (Voluntário Obras)",
          payerPhone: "51999992222",
          isDonation: true,
          status: "DOACAO",
          repaidAmount: 0.0,
          notes: "Irmão Carlos doou o material elétrico excedente de sua oficina",
          repaymentHistory: [],
        },
      ],
    },
    {
      eventId: currentEvent._id,
      title: "Rancho de Alimentação & Gás da Cozinha",
      category: "ALIMENTACAO",
      nature: "OPERACIONAL",
      description: "Carnes para churrasco de sábado e botijões de gás",
      totalAmount: 420.0,
      totalRepaid: 240.0,
      items: [
        {
          _id: new Types.ObjectId(),
          description: "2 Botijões de Gás P13 para Cozinha",
          amount: 240.0,
          paidBy: "Mateus Oliveira (Voluntário Cozinha)",
          payerPhone: "51999993333",
          isDonation: false,
          status: "REEMBOLSADO",
          repaidAmount: 240.0,
          repaymentHistory: [
            {
              _id: new Types.ObjectId(),
              amount: 240.0,
              date: new Date(Date.now() - 43200000),
              method: "DINHEIRO",
              operatorName: "Rodrigo Granada",
            },
          ],
        },
        {
          _id: new Types.ObjectId(),
          description: "Verduras, Frutas e Pães para Café da Manhã",
          amount: 180.0,
          paidBy: "Mateus Oliveira (Voluntário Cozinha)",
          payerPhone: "51999993333",
          isDonation: false,
          status: "PENDENTE",
          repaidAmount: 0.0,
          repaymentHistory: [],
        },
      ],
    },
  ]);
  console.log(`✔️ 2 Grupos de Despesas cadastrados com itens Quitados, Parciais, Pendentes e Doações.`);

  // 8. Inserir Receitas Extras do Evento
  await EventIncomeModel.insertMany([
    {
      eventId: currentEvent._id,
      title: "Inscrições do Retiro - 1º Lote (40 Participantes)",
      type: "INSCRICOES",
      amount: 4800.0,
      notes: "40 inscrições pagas via Pix para a conta da igreja",
    },
    {
      eventId: currentEvent._id,
      title: "Rifa Beneficente de Uma Bicicleta",
      type: "RIFA",
      amount: 1200.0,
      notes: "Arrecadação total da rifa de pré-retiro",
    },
    {
      eventId: currentEvent._id,
      title: "Oferta e Doação Espontânea de Famílias",
      type: "DOACAO",
      amount: 600.0,
      notes: "Oferta destinada a cobrir custos de infraestrutura",
    },
  ]);
  console.log(`✔️ 3 Receitas Extras cadastradas (Inscrições, Rifa e Doações).`);

  // 9. Inserir Vendas no PDV
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
      operatorId: adminRodrigo.id,
      createdAt: new Date(),
    },
    {
      customerId: clienteBruno._id,
      eventId: currentEvent._id,
      totalPrice: 52.0,
      status: "PENDENTE", // Fiado
      items: [
        {
          productId: currentProducts[2]._id, // Livro (40,00)
          quantity: 1,
          priceAtPurchase: 40.0,
        },
        {
          productId: currentProducts[4]._id, // Café & Cookie (12,00)
          quantity: 1,
          priceAtPurchase: 12.0,
        },
      ],
      operatorId: adminRodrigo.id,
      createdAt: new Date(),
    },
  ]);
  console.log(`✔️ 2 Vendas cadastradas no PDV (1 Paga e 1 Pendente).`);

  // 10. Inserir Logs de Auditoria
  await LogModel.insertMany([
    {
      userId: adminRodrigo.id,
      userName: "Rodrigo Granada (Admin)",
      action: "system_seed",
      description: "Banco de dados populado com dados de teste para o Retiro 2026",
      metadata: { eventId: currentEvent.id },
    },
  ]);

  console.log(`\n======================================================`);
  console.log(`🎉 [SEED CONCLUÍDO COM SUCESSO!]`);
  console.log(`======================================================`);
  console.log(`👤 Login Admin: CPF 11111111111 (Rodrigo Granada)`);
  console.log(`👤 Voluntário Obras: CPF 22222222222 (Carlos Eduardo)`);
  console.log(`👤 Participante Comum: CPF 44444444444 (Felipe Santos)`);
  console.log(`🏆 Evento Ativo: "Retiro Homens de Fé 2026"`);
  console.log(`📦 Evento Passado p/ Importar Sobras: "Retiro Homens de Fé 2025"`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Erro fatal ao rodar seed:", err);
  process.exit(1);
});
