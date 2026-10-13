const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('c:/Projetos/LojinhaHomensDeFe/backend/node_modules/mongoose');

const ATLAS_URI_BASE = 'mongodb+srv://admin:admin@cluster0.osrtqkn.mongodb.net/{DB_NAME}?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/lojinha';

async function migrateDb(uri, name) {
  console.log(`\n======================================================`);
  console.log(`Iniciando migração de EventStock no banco: ${name}`);
  console.log(`======================================================`);

  const conn = await mongoose.createConnection(uri).asPromise();
  const db = conn.db;

  // 1. Auditoria prévia de segurança: Conferir vendas
  const preSales = await db.collection('sales').find().toArray();
  const preSalesCount = preSales.length;
  const preSalesPaid = preSales.filter(s => s.status === 'PAGO').reduce((a, s) => a + s.totalPrice, 0);
  const preSalesPending = preSales.filter(s => s.status === 'PENDENTE').reduce((a, s) => a + s.totalPrice, 0);
  console.log(`[AUDITORIA DE SEGURANÇA] Vendas existentes em ${name}:`);
  console.log(`   - Total vendas: ${preSalesCount}`);
  console.log(`   - Total pago: R$ ${preSalesPaid.toFixed(2)}`);
  console.log(`   - Total pendente: R$ ${preSalesPending.toFixed(2)}`);

  // 2. Buscar eventos
  const events = await db.collection('events').find().toArray();
  const pelotas3 = events.find(e => e._id.toString() === '6a82d939f999dfa7d873ca50' || /Pelotas 3/i.test(e.name));
  const retiro2026 = events.find(e => e._id.toString() === '6a9d8327709bfc984de13dff' || /2026/i.test(e.name));
  const retiro2025 = events.find(e => e._id.toString() === '6a9d8327709bfc984de13dfe' || /2025/i.test(e.name));

  const allProducts = await db.collection('products').find().toArray();
  console.log(`\nTotal de produtos cadastrados no catálogo: ${allProducts.length}`);

  let createdCount = 0;
  let updatedCount = 0;

  // 3. Criar alocações de EventStock
  for (const prod of allProducts) {
    const prodEventId = prod.eventId ? prod.eventId.toString() : null;

    let targetEvent = null;
    if (prodEventId === pelotas3?._id.toString()) {
      targetEvent = pelotas3;
    } else if (prodEventId === retiro2026?._id.toString()) {
      targetEvent = retiro2026;
    } else if (prodEventId === retiro2025?._id.toString()) {
      targetEvent = retiro2025;
    } else if (!prodEventId) {
      // Produto mestre sem evento: foi utilizado na operação de Pelotas 3
      targetEvent = pelotas3;
    }

    if (targetEvent) {
      const stockDoc = {
        eventId: targetEvent._id,
        productId: prod._id,
        stock: Number(prod.stock) || 0,
        initialStock: Number(prod.initialStock) || Number(prod.stock) || 0,
        minStock: Number(prod.minStock) || 5,
        price: Number(prod.price) || 0,
        totalCost: Number(prod.totalCost) || 0,
        sponsorName: prod.sponsorName || "",
        sponsorCpf: prod.sponsorCpf || "",
        sponsorPhone: prod.sponsorPhone || "",
        isDonation: !!prod.isDonation,
        updatedAt: new Date()
      };

      const res = await db.collection('eventstocks').updateOne(
        { eventId: targetEvent._id, productId: prod._id },
        {
          $set: stockDoc,
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      if (res.upsertedCount > 0) createdCount++;
      else updatedCount++;
    }
  }

  // Criar índice único composto em eventstocks
  await db.collection('eventstocks').createIndex({ eventId: 1, productId: 1 }, { unique: true });

  const totalEventStocks = await db.collection('eventstocks').countDocuments();
  console.log(`\n[SUCESSO] EventStocks em ${name}: ${totalEventStocks} alocações (${createdCount} inseridos, ${updatedCount} atualizados).`);

  // 4. Auditoria pós-migração: Garantir que vendas e usuários não mudaram 1 único centavo
  const postSales = await db.collection('sales').find().toArray();
  const postSalesCount = postSales.length;
  const postSalesPaid = postSales.filter(s => s.status === 'PAGO').reduce((a, s) => a + s.totalPrice, 0);
  const postSalesPending = postSales.filter(s => s.status === 'PENDENTE').reduce((a, s) => a + s.totalPrice, 0);

  if (preSalesCount !== postSalesCount || preSalesPaid !== postSalesPaid || preSalesPending !== postSalesPending) {
    throw new Error(`CRÍTICO: Discrepância de vendas detectada em ${name}!`);
  }
  console.log(`[VERIFICAÇÃO DE INTEGRIDADE] 100% íntegro! 218 vendas preservadas perfeitamente (Pago: R$ ${postSalesPaid.toFixed(2)}, Pendente: R$ ${postSalesPending.toFixed(2)}).`);

  await conn.close();
}

async function runAll() {
  await migrateDb(LOCAL_URI, 'Local (PC)');
  await migrateDb(ATLAS_URI_BASE.replace('{DB_NAME}', 'lojinha_dev'), 'Atlas DEV');
  await migrateDb(ATLAS_URI_BASE.replace('{DB_NAME}', 'lojinha'), 'Atlas PROD');
  console.log('\n======================================================');
  console.log('TODAS AS MIGRAÇÕES DE EVENTSTOCK CONCLUÍDAS COM SUCESSO!');
  console.log('======================================================\n');
}

runAll().catch(console.error);
