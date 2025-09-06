# twodev_be

Backend API for digitalization of LSP (Lembaga Sertifikasi Profesi) built with Express, TypeScript, and Drizzle ORM (MySQL) from Twodev startup.

## Features

- User CRUD (basic example)
- Express.js server
- TypeScript support
- Drizzle ORM (MySQL)
- Environment variable support with dotenv

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

### 4. Setup database & Drizzle

- Buat database kosong di MySQL
- Jalankan migrasi schema dengan Drizzle:
  ```bash
  npm run drizzle:push
  ```
- Jalankan Seeder:
  ```bash
  npm run seed
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

---

## API Endpoint

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user info

### User
- `GET /api/users` — List users
- `GET /api/users/:id` — Get user by ID
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### Assessee
- `POST /api/assessee` — Create assessee
- `GET /api/assessee` — List assessees
- `GET /api/assessee/:id` — Get assessee by ID
- `PUT /api/assessee/:id` — Update assessee
- `DELETE /api/assessee/:id` — Delete assessee

### Assessor
- `POST /api/assessor` — Create assessor
- `GET /api/assessor` — List assessors
- `GET /api/assessor/user/:userId` — Get assessor by user ID
- `GET /api/assessor/:id` — Get assessor by ID
- `PUT /api/assessor/:id` — Update assessor
- `DELETE /api/assessor/:id` — Delete assessor

### Assessor Detail
- `GET /api/assessor-detail/:assessorId` — Get detail by assessor ID
- `POST /api/assessor-detail/:assessorId` — Upsert detail by assessor ID

### Occupation
- `POST /api/occupations` — Create occupation
- `GET /api/occupations` — List occupations
- `GET /api/occupations/:id` — Get occupation by ID
- `PUT /api/occupations/:id` — Update occupation
- `DELETE /api/occupations/:id` — Delete occupation
- `GET /api/occupations/export/excel` — Export occupations to Excel

### Scheme
- `POST /api/schemes` — Create scheme
- `GET /api/schemes` — List schemes
- `GET /api/schemes/:id` — Get scheme by ID
- `PUT /api/schemes/:id` — Update scheme
- `DELETE /api/schemes/:id` — Delete scheme
- `GET /api/schemes/export/excel` — Export schemes to Excel

### Public
- `GET /api/public/assessee/:id` — Get assessee public info
- `GET /api/public/assessor/:id` — Get assessor public info

### Dashboard
- `GET /api/dashboard/admin/` — Get dashboard data (admin)
- `GET /api/dashboard/admin/summary` — Get dashboard summary
- `GET /api/dashboard/admin/schedules` — Get assessment schedules
- `GET /api/dashboard/admin/verifications` — Get verification docs
- `GET /api/dashboard/assessor/:assessorId/:assessmentId/:type` — Get APL02 assessee data

### Approval (Admin)
- `POST /api/approval/apl01` — Approve APL-01 document
- `POST /api/approval/competency` — Approve competency

### Schedule
- `GET /api/schedules` — List schedules
- `GET /api/schedules/active` — Get active schedules (assessee only)
- `GET /api/schedules/completed` — Get completed schedules
- `GET /api/schedules/completed/:assesseeId` — Get completed schedules by assessee
- `GET /api/schedules/:id` — Get schedule by ID (assessee only)
- `POST /api/schedules` — Create schedule
- `DELETE /api/schedules/:id` — Delete schedule
- `GET /api/schedules/export/excel` — Export schedules to Excel

### Assessment & Related
- `POST /api/assessments/create` — Create assessment
- `GET /api/assessments` — List assessments
- `GET /api/assessments/:id` — Get assessment by ID
- `DELETE /api/assessments/:id` — Delete assessment
- `GET /api/assessments/result/:assessmentId/:assessorId/:assesseeId` — Get assessment result details

#### APL-01
- `POST /api/assessments/apl-01/create-self-data` — Create assessee APL-01 data
- `POST /api/assessments/apl-01/create-certificate-docs` — Upload certificate docs
- `GET /api/assessments/apl-01/results` — Get all APL-01 results
- `GET /api/assessments/apl-01/results/assessor/:assessorId` — Get APL-01 results by assessor
- `GET /api/assessments/apl-01/results/unapproved` — Get unapproved APL-01 results
- `PUT /api/assessments/apl-01/results/:resultId/approve` — Approve APL-01 result
- `GET /api/assessments/apl-01/results/:assessmentId` — Get APL-01 results by assessment

#### APL-02
- `GET /api/assessments/apl-02/units/:resultId` — Get APL-02 units
- `GET /api/assessments/apl-02/units/:resultId/elements/:unitId` — Get APL-02 elements by unit
- `POST /api/assessments/apl-02/result/send` — Send APL-02 result
- `POST /api/assessments/apl-02/result/send-header` — Send APL-02 result header
- `GET /api/assessments/apl-02/result/units/:resultId` — Get APL-02 units result
- `GET /api/assessments/apl-02/result/units/:resultId/elements/:unitId` — Get APL-02 elements result
- `PUT /api/assessments/apl-02/result/assessor/:resultId/approve` — Assessor approve APL-02
- `PUT /api/assessments/apl-02/result/assessee/:resultId/approve` — Assessee approve APL-02
- `GET /api/assessments/apl-02/result/:resultId` — Get APL-02 result details

#### IA-01
- `GET /api/assessments/ia-01/units/:resultId` — Get IA-01 groups
- `GET /api/assessments/ia-01/units/:resultId/elements/:unitId` — Get IA-01 elements by unit
- `POST /api/assessments/ia-01/result/send` — Send IA-01 result
- `POST /api/assessments/ia-01/result/send-header` — Send IA-01 result header
- `PUT /api/assessments/ia-01/result/assessor/:resultId/approve` — Assessor approve IA-01
- `PUT /api/assessments/ia-01/result/assessee/:resultId/approve` — Assessee approve IA-01
- `GET /api/assessments/ia-01/result/:resultId` — Get IA-01 result details

#### IA-02
- `GET /api/assessments/ia-02/units/:assessmentId` — Get IA-02 groups
- `PUT /api/assessments/ia-02/result/assessor/:resultId/approve` — Assessor approve IA-02
- `PUT /api/assessments/ia-02/result/assessee/:resultId/approve` — Assessee approve IA-02
- `GET /api/assessments/ia-02/result/:resultId` — Get IA-02 result details
- `POST /api/assessments/ia-02/upload-pdf/:assessmentId` — Upload IA-02 PDF
- `GET /api/assessments/ia-02/pdf/:assessmentId` — Get IA-02 PDF

#### IA-03
- `GET /api/assessments/ia-03/units/:resultId` — Get IA-03 groups
- `POST /api/assessments/ia-03/result/send` — Send IA-03 result
- `PUT /api/assessments/ia-03/result/assessor/:resultId/approve` — Assessor approve IA-03
- `PUT /api/assessments/ia-03/result/assessee/:resultId/approve` — Assessee approve IA-03
- `GET /api/assessments/ia-03/result/:resultId` — Get IA-03 result details

#### IA-05
- `GET /api/assessments/ia-05/questions/:assessmentId` — Get IA-05 questions
- `GET /api/assessments/ia-05/result/answers/keys/:assessmentId` — Get IA-05 answer keys
- `GET /api/assessments/ia-05/result/answers/:resultId` — Get IA-05 assessee answers
- `POST /api/assessments/ia-05/result/assessee/send` — Send IA-05 assessee result
- `POST /api/assessments/ia-05/result/assessor/send` — Send IA-05 assessor result
- `PUT /api/assessments/ia-05/result/assessor/:resultId/approve` — Assessor approve IA-05
- `PUT /api/assessments/ia-05/result/assessee/:resultId/approve` — Assessee approve IA-05
- `GET /api/assessments/ia-05/result/:resultId` — Get IA-05 result details

#### AK-01
- `POST /api/assessments/ak-01` — Create AK-01
- `GET /api/assessments/ak-01/:id` — Get AK-01 by ID
- `PUT /api/assessments/ak-01/:id` — Update AK-01
- `DELETE /api/assessments/ak-01/:id` — Delete AK-01
- `GET /api/assessments/ak-01/data/:resultId` — Get AK-01 data
- `PUT /api/assessments/ak-01/result/assessor/:resultId/approve` — Assessor approve AK-01
- `PUT /api/assessments/ak-01/result/assessee/:resultId/approve` — Assessee approve AK-01
- `GET /api/assessments/ak-01/result/:resultId` — Get AK-01 result by resultId

#### AK-02
- `POST /api/assessments/ak-02/result/send` — Send AK-02 result
- `GET /api/assessments/ak-02/units/:assessmentId` — Get AK-02 units
- `GET /api/assessments/ak-02/result/:resultId` — Get AK-02 result by resultId
- `PUT /api/assessments/ak-02/result/assessor/:resultId/approve` — Assessor approve AK-02
- `PUT /api/assessments/ak-02/result/assessee/:resultId/approve` — Assessee approve AK-02

#### AK-03
- `POST /api/assessments/ak-03` — Create AK-03
- `GET /api/assessments/ak-03/:result_id` — Get AK-03 by resultId

#### AK-04
- `POST /api/assessments/ak-04` — Create AK-04
- `GET /api/assessments/ak-04/:resultId` — Get AK-04 by resultId
- `PUT /api/assessments/ak-04/result/assessee/:resultId/approve` — Assessee approve AK-04

#### AK-05
- `POST /api/assessments/ak-05` — Create AK-05
- `GET /api/assessments/ak-05/:result_id` — Get AK-05 by resultId
- `PUT /api/assessments/ak-05/result/assessor/:resultId/approve` — Assessor approve AK-05

#### Verification
- `GET /api/assessments/verification/pending` — Get pending verifications
- `GET /api/assessments/verification/approved` — Get approved verifications
- `GET /api/assessments/verification/:resultId` — Get verification detail
- `POST /api/assessments/verification/:resultId/approve` — Approve verification

#### Uploads
- `POST /api/uploads` — Upload files

#### Serve Uploaded Files
- `GET /uploads/apl-01/:folder/:filename` — Get uploaded APL-01 file (secured)
- `GET /uploads/*` — Serve uploaded files (secured)

---

## Struktur Direktori

```
.env
drizzle.config.js / drizzle.config.ts
package.json
README.md
tsconfig.json
public/
  uploads/
    apl-01/
    ia-02/
src/
  app.ts          # Express app setup
  server.ts       # Entry point
  common/
    async.handler.ts
    error.ts
  config/
    db.ts
    drizzle.ts
    seed.ts
  middleware/
    auth.middleware.ts
    error.middleware.ts
  modules/
    admin/
    assessee/
    assessement/
    assessor/
    assessor-detail/
    auth/
    dashboard/
    occupation/
    public/
    ...
  utils/
    ...
drizzle/
  schema.ts
  migrations/
```
