const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
  console.log('Starting migration on Neon Database...');
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon DB.');

    const schemaSql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
    console.log('Executing SQL schema...');
    
    await client.query(schemaSql);
    console.log('🎉 Database migration completed successfully! Table "audits" is created.');
    
    await client.end();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
