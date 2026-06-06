const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://localhost:27017';
const dbName = 'sima_db';

async function importCollection(client, collectionName, filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Opcional: Limpiar colección antes de importar
        await collection.deleteMany({});
        
        if (Array.isArray(data)) {
            const result = await collection.insertMany(data);
            console.log(`✅ ${collectionName}: ${result.insertedCount} documentos importados`);
        } else {
            const result = await collection.insertOne(data);
            console.log(`✅ ${collectionName}: 1 documento importado`);
        }
    } catch (error) {
        console.error(`❌ Error importando ${collectionName}:`, error.message);
    }
}

async function importAll() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Conectado a MongoDB\n');
        
        const backupDir = path.join(__dirname, 'sima_db_backup');
        
        await importCollection(client, 'users', path.join(backupDir, 'users.json'));
        await importCollection(client, 'cursos', path.join(backupDir, 'cursos.json'));
        await importCollection(client, 'seccions', path.join(backupDir, 'seccions.json'));
        await importCollection(client, 'carreras', path.join(backupDir, 'carreras.json'));
        await importCollection(client, 'calificacions', path.join(backupDir, 'calificacions.json'));
        
        console.log('\n🎉 Importación completada!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.close();
    }
}

importAll();
