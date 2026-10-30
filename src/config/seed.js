require('dotenv').config();
const pool = require('./db');

// Prendas de la tienda: precio de venta, costo de compra y código para el SKU
const prendas = [
  { nombre: 'Camiseta oversize', categoria: 'Camisetas', precio: 100000, costo: 50000, codigo: 'CAM-OVR' },
  { nombre: 'Camiseta boxy fit', categoria: 'Camisetas', precio: 110000, costo: 55000, codigo: 'CAM-BOX' },
  { nombre: 'Saco', categoria: 'Sacos', precio: 220000, costo: 110000, codigo: 'SAC' },
  { nombre: 'Chaqueta', categoria: 'Chaquetas', precio: 150000, costo: 75000, codigo: 'CHA' },
  { nombre: 'Sudadera', categoria: 'Sudaderas', precio: 250000, costo: 125000, codigo: 'SUD' },
  { nombre: 'Jeans', categoria: 'Jeans', precio: 80000, costo: 40000, codigo: 'JEA' },
  { nombre: 'Gorra', categoria: 'Gorras', precio: 60000, costo: 30000, codigo: 'GOR', tallas: ['U'] },
];

// Máximo de unidades que se venden en un día, según la talla
const ventaMaxima = { S: 1, M: 3, L: 2, XL: 1, U: 2 };

// Con cuánto stock queda cada talla al final (L y XL quedan bajas para que salte la alerta)
const stockFinal = { S: 6, M: 25, L: 5, XL: 2, U: 10 };

// Número al azar entre 0 y max
function azar(max) {
  return Math.floor(Math.random() * (max + 1));
}

// Fecha de hace N días
function haceDias(n) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - n);
  return fecha;
}

function sumar(lista) {
  return lista.reduce((total, n) => total + n, 0);
}

// Crea un lote y anota su ENTRADA en movimientos
async function crearLote(client, varianteId, cantidad, disponible, costo, diasAtras) {
  const lote = await client.query(
    `INSERT INTO lotes (variante_id, cantidad_inicial, cantidad_disponible, costo_unitario, fecha_entrada)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [varianteId, cantidad, disponible, costo, haceDias(diasAtras)]
  );
  const loteId = lote.rows[0].id;

  await client.query(
    `INSERT INTO movimientos (variante_id, lote_id, tipo, cantidad, costo_unitario, fecha)
     VALUES ($1, $2, 'ENTRADA', $3, $4, $5)`,
    [varianteId, loteId, cantidad, costo, haceDias(diasAtras)]
  );

  return loteId;
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Borrar los datos de prueba (los usuarios no se tocan)
    await client.query('TRUNCATE movimientos, lotes, variantes, productos RESTART IDENTITY CASCADE');

    for (const prenda of prendas) {
      // 2. Crear la prenda
      const producto = await client.query(
        `INSERT INTO productos (nombre, categoria, precio, tiempo_entrega_dias)
         VALUES ($1, $2, $3, 3) RETURNING id`,
        [prenda.nombre, prenda.categoria, prenda.precio]
      );
      const productoId = producto.rows[0].id;

      const tallas = prenda.tallas || ['S', 'M', 'L', 'XL'];

      for (const talla of tallas) {
        // 3. Crear la talla con su SKU (ej: CAM-OVR-M)
        const variante = await client.query(
          `INSERT INTO variantes (producto_id, talla, sku, stock_minimo)
           VALUES ($1, $2, $3, 3) RETURNING id`,
          [productoId, talla, `${prenda.codigo}-${talla}`]
        );
        const varianteId = variante.rows[0].id;

        // 4. Inventar las ventas de los últimos 30 días
        const ventas = [];
        for (let i = 0; i < 30; i++) {
          ventas.push(azar(ventaMaxima[talla]));
        }
        const vendidoPrimeros15 = sumar(ventas.slice(0, 15));
        const vendidoUltimos15 = sumar(ventas.slice(15));

        // 5. Dos compras (PEPS): el lote 1 alcanza para los primeros 15 días,
        //    el lote 2 (más caro) para los últimos 15 y lo que queda en bodega.
        //    Mínimo 1 unidad porque la tabla no acepta lotes de 0 (CHECK > 0)
        const cantidad1 = Math.max(vendidoPrimeros15, 1);
        const cantidad2 = vendidoUltimos15 + stockFinal[talla];
        const costo2 = prenda.costo + 3000;

        const lote1 = await crearLote(client, varianteId, cantidad1, cantidad1 - vendidoPrimeros15, prenda.costo, 30);
        const lote2 = await crearLote(client, varianteId, cantidad2, stockFinal[talla], costo2, 15);

        // 6. Registrar cada venta: primeros 15 días salen del lote 1, los últimos 15 del lote 2
        for (let i = 0; i < 30; i++) {
          if (ventas[i] === 0) continue;

          const loteId = i < 15 ? lote1 : lote2;
          const costo = i < 15 ? prenda.costo : costo2;

          await client.query(
            `INSERT INTO movimientos (variante_id, lote_id, tipo, cantidad, costo_unitario, fecha)
             VALUES ($1, $2, 'SALIDA', $3, $4, $5)`,
            [varianteId, loteId, ventas[i], costo, haceDias(29 - i)]
          );
        }
      }
    }

    await client.query('COMMIT');
    console.log('Datos cargados: 7 prendas, 25 tallas y 30 días de ventas');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al cargar datos:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();