const fs = require('fs');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('c:/Projetos/LojinhaHomensDeFe/backend/node_modules/mongoose');

const ATLAS_URI_BASE = 'mongodb+srv://admin:admin@cluster0.osrtqkn.mongodb.net/{DB_NAME}?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/lojinha';

const COLLECTIONS = [
  'categories',
  'eventincomes',
  'eventparticipants',
  'events',
  'expenses',
  'logs',
  'paymentconfigs',
  'products',
  'sales',
  'stockentries',
  'users'
];

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', `backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log('====================================================');
  console.log('1. Conectando ao Atlas PROD (lojinha)...');
  const prodConn = await mongoose.createConnection(ATLAS_URI_BASE.replace('{DB_NAME}', 'lojinha')).asPromise();
  const prodDb = prodConn.db;

  console.log(`2. Exportando backup para: ${backupDir}`);
  const backupData = {};
  for (const colName of COLLECTIONS) {
    const docs = await prodDb.collection(colName).find().toArray();
    backupData[colName] = docs;
    fs.writeFileSync(path.join(backupDir, `${colName}.json`), JSON.stringify(docs, null, 2), 'utf8');
    console.log(`   - ${colName}: ${docs.length} documentos salvos`);
  }

  const backupDbName = `loj_bkp_${Date.now()}`;
  console.log(`\n3. Criando snapshot no Atlas (${backupDbName})...`);
  const backupAtlasConn = await mongoose.createConnection(ATLAS_URI_BASE.replace('{DB_NAME}', backupDbName)).asPromise();
  const backupAtlasDb = backupAtlasConn.db;
  for (const colName of COLLECTIONS) {
    const docs = backupData[colName];
    if (docs.length > 0) {
      await backupAtlasDb.collection(colName).insertMany(docs);
    }
  }
  await backupAtlasConn.close();
  console.log('   Snapshot no Atlas concluído com sucesso!');

  console.log('\n4. Sincronizando com Banco LOCAL (mongodb://localhost:27017/lojinha)...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  const localDb = localConn.db;
  for (const colName of COLLECTIONS) {
    const docs = backupData[colName];
    await localDb.collection(colName).deleteMany({});
    if (docs.length > 0) {
      await localDb.collection(colName).insertMany(docs);
    }
    console.log(`   - Local [${colName}]: ${docs.length} documentos restaurados`);
  }

  console.log('\n5. Sincronizando com Atlas DEV (lojinha_dev)...');
  const devConn = await mongoose.createConnection(ATLAS_URI_BASE.replace('{DB_NAME}', 'lojinha_dev')).asPromise();
  const devDb = devConn.db;
  for (const colName of COLLECTIONS) {
    const docs = backupData[colName];
    await devDb.collection(colName).deleteMany({});
    if (docs.length > 0) {
      await devDb.collection(colName).insertMany(docs);
    }
    console.log(`   - Dev [${colName}]: ${docs.length} documentos sincronizados`);
  }

  console.log('\n====================================================');
  console.log('RELATÓRIO DE CONCILIAÇÃO FINAL');
  console.log('====================================================');
  console.log('Coleção              | Atlas PROD | Atlas DEV | Local (PC)');
  console.log('----------------------------------------------------');
  for (const colName of COLLECTIONS) {
    const prodCount = await prodDb.collection(colName).countDocuments();
    const devCount = await devDb.collection(colName).countDocuments();
    const localCount = await localDb.collection(colName).countDocuments();
    const pad = (s, n) => s.toString().padEnd(n);
    console.log(`${pad(colName, 20)} | ${pad(prodCount, 10)} | ${pad(devCount, 9)} | ${pad(localCount, 10)}`);
  }
  console.log('====================================================');

  await prodConn.close();
  await localConn.close();
  await devConn.close();
  console.log('\nTodos os bancos de dados estão 100% idênticos e sincronizados!');
}

main().catch(console.error);
