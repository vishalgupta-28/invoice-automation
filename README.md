# Invoice Automation System

Full-stack invoice management platform with:

- **Frontend + API Routes:** Next.js 14 (App Router, TypeScript, Tailwind, shadcn-style UI)
- **Database:** PostgreSQL + Prisma ORM
- **Backend Services:** Python FastAPI (PDF generation via WeasyPrint, SMTP email dispatch)
- **Service Communication:** Next.js API routes proxy requests to FastAPI (`/generate-pdf`, `/send-email`)

## Project Structure

```text
invoice-app/
  frontend/
  backend/
  docker-compose.yml
```

## Environment Files

### `frontend/.env.local`

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/invoicedb
PYTHON_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### `backend/.env`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
```

## Run With Docker Compose

From `invoice-app`:

```bash
docker compose up --build
```

Services:

- Frontend: [http://localhost:3000](http://localhost:3000)
- FastAPI backend: [http://localhost:8000](http://localhost:8000)
- PostgreSQL: `localhost:5432`

## Run Locally Without Docker

### 1) Database

Start PostgreSQL locally and create `invoicedb`.

### 2) Frontend

```bash
cd frontend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Features Implemented

- Prisma models: `Client`, `Invoice`, `LineItem`, `Payment`
- Invoice status enum: `DRAFT`, `SENT`, `PAID`, `OVERDUE`
- Currency support: `USD` (default), `INR`, `EUR`
- Auto invoice number generation format: `INV-YYYY-XXXX`
- Full invoice/client REST APIs in Next.js App Router
- PDF proxy + Email proxy endpoints in Next.js
- FastAPI PDF generation using Jinja2 + WeasyPrint
- FastAPI SMTP email dispatch with PDF attachment
- Dashboard with KPIs, recent invoices, monthly revenue chart (Recharts)
- Invoice list with search/filter/sort/status badges/actions
- Invoice creation form with `react-hook-form` + `zod` validation and dynamic line items
- Invoice detail actions: PDF preview, send email, mark as paid
- Clients management page with zod-validated create form

## API Endpoints

### Next.js API

- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/[id]`
- `PUT /api/invoices/[id]`
- `DELETE /api/invoices/[id]`
- `GET /api/clients`
- `POST /api/clients`
- `POST /api/pdf`
- `POST /api/email`

### FastAPI

- `POST /generate-pdf`
- `POST /send-email`
- `GET /health`
