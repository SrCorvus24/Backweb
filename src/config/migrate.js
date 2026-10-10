const pool = require('./db');

const schema = [
  {
    table: 'users',
    create: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    columns: [
      { name: 'name',       def: 'VARCHAR(100) NOT NULL' },
      { name: 'email',      def: 'VARCHAR(150)' },
      { name: 'password',   def: 'VARCHAR(255) NOT NULL' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ],
  },
  {
    table: 'productos',
    create: `
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        precio NUMERIC(14,2) NOT NULL CHECK (precio > 0),
        tiempo_entrega_dias INTEGER NOT NULL DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    columns: [],
  },
  {
    table: 'variantes',
    create: `
      CREATE TABLE IF NOT EXISTS variantes (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER NOT NULL REFERENCES productos(id),
        talla VARCHAR(10) NOT NULL,
        sku VARCHAR(40) UNIQUE NOT NULL,
        stock_minimo INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (producto_id, talla)
      )
    `,
    columns: [],
  },
  {
    table: 'lotes',
    create: `
      CREATE TABLE IF NOT EXISTS lotes (
        id SERIAL PRIMARY KEY,
        variante_id INTEGER NOT NULL REFERENCES variantes(id),
        cantidad_inicial INTEGER NOT NULL CHECK (cantidad_inicial > 0),
        cantidad_disponible INTEGER NOT NULL CHECK (cantidad_disponible >= 0),
        costo_unitario NUMERIC(14,2) NOT NULL CHECK (costo_unitario > 0),
        fecha_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    columns: [],
  },
];

async function runMigrations() {
  for (const entry of schema) {
    await pool.query(entry.create);

    const { rows } = await pool.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
      [entry.table]
    );
    const existing = rows.map((r) => r.column_name);

    for (const col of entry.columns) {
      if (!existing.includes(col.name)) {
        await pool.query(`ALTER TABLE ${entry.table} ADD COLUMN IF NOT EXISTS ${col.name} ${col.def}`);
        console.log(`Columna añadida: ${entry.table}.${col.name}`);
      }
    }

    console.log(`Tabla lista: ${entry.table}`);
  }
}

module.exports = runMigrations;