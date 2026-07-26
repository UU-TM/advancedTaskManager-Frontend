# Advanced Task Manager — Frontend

Next.js frontend for the Advanced Task Manager API.

## Prerequisites

- Node.js 22+ and npm (local development)
- Docker and Docker Compose (containerized runs)
- Backend API running (default `http://localhost:3000`)

## Environment

Copy `.env.example` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API URL for the **browser** (baked in at Docker **build** time) |
| `API_URL` | API URL for **Next.js server** proxies (Docker **runtime**; defaults to `http://host.docker.internal:3000`) |

Local `npm run dev` only needs `NEXT_PUBLIC_API_URL`. Docker needs both so auth proxies inside the container can reach the API on the host.

## Local development

```bash
npm install
npm run dev
```

App: [http://localhost:3001](http://localhost:3001)

## Docker

Ensure the NestJS API is listening on the host (port 3000), then:

```bash
docker compose up --build
```

App: [http://localhost:3001](http://localhost:3001)

Override URLs if needed:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000 \
API_URL=http://host.docker.internal:3000 \
docker compose up --build
```

Stop:

```bash
docker compose down
```
