# twodev_be

Backend API built with Express, TypeScript, and Prisma ORM (MySQL).

## Features
- User CRUD (basic example)
- Express.js server
- TypeScript support
- Prisma ORM (MySQL)
- Environment variable support with dotenv

## Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- MySQL database

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ztacole/twodev_be.git
cd twodev_be
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Buat file `.env` di root project dan tambahkan:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
PORT=3000
```

Ganti `USER`, `PASSWORD`, `HOST`, `PORT`, dan `DATABASE` sesuai konfigurasi MySQL Anda.

### 4. Setup database & Prisma

Generate Prisma client:
```bash
npm run prisma:generate
```

Jalankan migrasi database:
```bash
npm run prisma:migrate
```

### 5. Jalankan aplikasi

#### Development (dengan hot reload):
```bash
npm run dev
```

#### Production (build & start):
```bash
npm run build
npm start
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port sesuai `.env`).

## API Endpoint

- `GET /api/users` — Mendapatkan semua user

## Struktur Direktori

```
prisma/           # Prisma schema & migration
src/
  app.ts          # Express app setup
  server.ts       # Entry point
  config/db.ts    # Prisma client config
  modules/user/   # Modul user (controller, service, routes, type)
  utils/          # Utility (logger)
```