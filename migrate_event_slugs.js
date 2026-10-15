const mongoose = require('mongoose');

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  const mongoUri = process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/lojinha';
  await mongoose.connect(mongoUri);
  console.log('Conectado ao MongoDB:', mongoUri);

  const eventsColl = mongoose.connection.collection('events');
  const productsColl = mongoose.connection.collection('products');

  const events = await eventsColl.find().toArray();
  console.log(`Encontrados ${events.length} eventos.`);

  let pelotas3Id = null;

  for (const ev of events) {
    let slug = slugify(ev.name);
    if (ev.name.includes('Pelotas 3')) {
      slug = 'homens-de-fe-pelotas-3';
      pelotas3Id = ev._id;
    } else if (ev.name.includes('2026')) {
      slug = 'homens-de-fe-2026';
    } else if (ev.name.includes('2025')) {
      slug = 'homens-de-fe-2025';
    }

    await eventsColl.updateOne(
      { _id: ev._id },
      { 
        $set: { 
          slug,
          city: ev.location || (ev.name.includes('Pelotas') ? 'Pelotas - RS' : '')
        } 
      }
    );
    console.log(`Evento "${ev.name}" -> slug: "${slug}"`);
  }

  // Ensure index on slug
  try {
    await eventsColl.createIndex({ slug: 1 }, { unique: true, sparse: true });
    console.log('Índice único criado para "slug".');
  } catch (err) {
    console.warn('Índice já existe ou aviso:', err.message);
  }

  // Atribuir produtos sem eventId ao Pelotas 3 se existir
  if (pelotas3Id) {
    const unlinked = await productsColl.updateMany(
      { $or: [{ eventId: null }, { eventId: { $exists: false } }] },
      { $set: { eventId: pelotas3Id } }
    );
    console.log(`Produtos vinculados ao Pelotas 3: ${unlinked.modifiedCount}`);
  }

  console.log('Migração de slugs de eventos concluída com sucesso!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
