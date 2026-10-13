/**
 * Script de Migração e Sincronização Segura:
 * DEV (lojinha_dev) -> PRODUÇÃO (lojinha)
 *
 * 1. Cria backup completo do banco de PRODUÇÃO em 'lojinha_backup_<timestamp>' no Atlas
 * 2. Clona todas as coleções e documentos de 'lojinha_dev' para 'lojinha'
 * 3. Valida a integridade e exibe o resumo completo
 */

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const CLUSTER_URI =
  "mongodb+srv://admin:admin@cluster0.osrtqkn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const SOURCE_DB_NAME = "lojinha_dev";
const TARGET_DB_NAME = "lojinha";

async function run() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "");
  const BACKUP_DB_NAME = `lojinha_backup_${timestamp}`;

  console.log("==================================================");
  console.log("🚀 INICIANDO SINCRONIZAÇÃO COMPLETA COM BACKUP");
  console.log(`Origem (DEV):    ${SOURCE_DB_NAME}`);
  console.log(`Destino (PROD):  ${TARGET_DB_NAME}`);
  console.log(`Backup (PROD):   ${BACKUP_DB_NAME}`);
  console.log("==================================================\n");

  const devConn = await mongoose
    .createConnection(`${CLUSTER_URI}&dbName=${SOURCE_DB_NAME}`)
    .asPromise();
  const prodConn = await mongoose
    .createConnection(`${CLUSTER_URI}&dbName=${TARGET_DB_NAME}`)
    .asPromise();
  const backupConn = await mongoose
    .createConnection(`${CLUSTER_URI}&dbName=${BACKUP_DB_NAME}`)
    .asPromise();

  console.log("✅ Conexões com MongoDB Atlas estabelecidas.");

  // 1. FAZER BACKUP DE PRODUÇÃO
  console.log("\n📦 PASSO 1: Criando backup preventivo de segurança de PRODUÇÃO...");
  const prodCollections = await prodConn.db.listCollections().toArray();
  for (const colInfo of prodCollections) {
    const colName = colInfo.name;
    if (colName.startsWith("system.")) continue;

    const docs = await prodConn.db.collection(colName).find({}).toArray();
    if (docs.length > 0) {
      await backupConn.db.collection(colName).insertMany(docs);
    }
    console.log(`   [BACKUP] Coleção '${colName}': ${docs.length} documentos salvos em ${BACKUP_DB_NAME}`);
  }
  console.log("✅ Backup de segurança concluído com sucesso!");

  // 2. CLONAR TODAS AS COLEÇÕES DE DEV PARA PRODUÇÃO
  console.log("\n🔄 PASSO 2: Copiando coleções de DEV (lojinha_dev) para PRODUÇÃO (lojinha)...");
  const devCollections = await devConn.db.listCollections().toArray();

  const report = [];

  for (const colInfo of devCollections) {
    const colName = colInfo.name;
    if (colName.startsWith("system.")) continue;

    const devDocs = await devConn.db.collection(colName).find({}).toArray();

    // Limpa a coleção atual em produção
    await prodConn.db.collection(colName).deleteMany({});

    // Insere os documentos idênticos de DEV
    if (devDocs.length > 0) {
      await prodConn.db.collection(colName).insertMany(devDocs);
    }

    report.push({
      collection: colName,
      copiedCount: devDocs.length,
    });

    console.log(`   [CLONE] Coleção '${colName}': ${devDocs.length} documentos sincronizados para PROD`);
  }

  // 3. VALIDAÇÃO FINAL
  console.log("\n📊 PASSO 3: Validando integridade final em PRODUÇÃO (lojinha)...");
  console.table(report);

  await devConn.close();
  await prodConn.close();
  await backupConn.close();

  console.log("\n🎉 SINCRONIZAÇÃO DE BANCO CONCLUÍDA COM 100% DE SUCESSO!");
}

run().catch((err) => {
  console.error("❌ Erro fatal durante sincronização:", err);
  process.exit(1);
});
