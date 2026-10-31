# DrStock - API (Node + Express + PostgreSQL)

Backend del inventario Just-in-Time de DrStock (tienda de ropa urbana de hombre, por talla).
Proyecto #12 del curso: motor de reorden y trazabilidad de lotes bajo PEPS.

## Que hace

- **PEPS:** cada venta descuenta primero del lote mas antiguo, dentro de una transaccion (todo o nada) con bloqueo `FOR UPDATE`
- **Movimientos:** cada entrada y salida queda guardada con su fecha (serie temporal de consumo)
- **Motor de reorden:** con las ventas de los ultimos 30 dias calcula ventas por dia, stock de seguridad (Z = 1.65) y punto de reorden
- **Login con doble token:** access token (JWT, 15 min) y refresh token rotativo en cookie HttpOnly, con revocacion de sesiones
- **Roles:** Administrador, Almacenista y Consulta, revisados en cada endpoint
- **Limite de intentos** en el login (10 cada 15 minutos)

## Tecnologias

Node.js, Express, PostgreSQL (Neon), bcrypt, jsonwebtoken, Swagger y PM2 en un VPS de DigitalOcean.

## Correr en el PC

1. Crear el archivo `.env` (ver `.env.example`)
2. Instalar y prender:

```
npm install --legacy-peer-deps
npm run dev
```

3. Crear usuarios y datos de prueba:

```
node src/config/usuarios.js
node src/config/seed.js
```

Documentacion de la API (Swagger): `http://localhost:3000/api-docs`

## Pruebas

```
npm test
```

Revisan las formulas del motor de reorden y los permisos por rol.

## Ramas

`feature/inventario` -> `develop` -> `qa` -> `main`, con Pull Requests. `main` es lo que corre en el VPS.

Autor: Xander Rodriguez Osorio
