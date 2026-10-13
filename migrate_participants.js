const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('c:/Projetos/LojinhaHomensDeFe/backend/node_modules/mongoose');

const uri = process.env.MONGODB_URI_CLOUD || 'mongodb+srv://admin:admin@cluster0.osrtqkn.mongodb.net/lojinha?retryWrites=true&w=majority&appName=Cluster0';

async function migrate(dbName) {
  const fullUri = uri.replace('/lojinha', '/' + dbName);
  console.log(`\n--- Migrating database: ${dbName} ---`);
  const conn = await mongoose.createConnection(fullUri).asPromise();
  const db = conn.db;

  const pelotas3Event = await db.collection('events').findOne({
    $or: [
      { _id: new mongoose.Types.ObjectId('6a82d939f999dfa7d873ca50') },
      { name: /Pelotas 3/i }
    ]
  });

  if (!pelotas3Event) {
    console.error('Evento Pelotas 3 não encontrado no banco ' + dbName);
    await conn.close();
    return;
  }

  console.log(`Evento encontrado: ${pelotas3Event.name} (${pelotas3Event._id})`);

  const users = await db.collection('users').find().toArray();
  console.log(`Total de usuários a vincular: ${users.length}`);

  let createdCount = 0;
  let alreadyExistsCount = 0;

  for (const user of users) {
    const existing = await db.collection('eventparticipants').findOne({
      eventId: pelotas3Event._id,
      userId: user._id
    });

    if (existing) {
      alreadyExistsCount++;
    } else {
      await db.collection('eventparticipants').insertOne({
        eventId: pelotas3Event._id,
        userId: user._id,
        type: 'ACAMPANTE',
        status: 'CONFIRMADO',
        notes: 'Migrado automaticamente como participante histórico de Pelotas 3',
        confirmedAt: new Date(),
        confirmedBy: 'system_migration',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      createdCount++;
    }
  }

  console.log(`Sucesso em ${dbName}: ${createdCount} participantes criados, ${alreadyExistsCount} já existiam.`);
  const totalParticipants = await db.collection('eventparticipants').countDocuments({ eventId: pelotas3Event._id });
  console.log(`Total de participantes agora em Pelotas 3: ${totalParticipants}`);

  await conn.close();
}

async function runAll() {
  await migrate('lojinha_dev');
  await migrate('lojinha');
}

runAll().catch(console.error);
