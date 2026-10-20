# E-commerce Backend

REST API for a multi-vendor marketplace. Each seller owns a shop, manages a product catalog with a draft/publish workflow, and gets inventory records created automatically when a product is added.

Built with Node.js, Express 5, MongoDB (Mongoose), and JWT authentication.

## Features

- **API-key gate** — every request must carry a valid `x-api-key`, and keys carry permissions (`0000`, `1111`, `2222`) checked before routing.
- **Shop accounts** — registration and login with bcrypt password hashing. Each shop has a role list, ready for staff accounts.
- **JWT access + refresh tokens** — 2-day access token, 7-day refresh token, signed with a per-login key pair stored server-side.
- **Refresh-token rotation with reuse detection** — a refresh token can be used once. Replaying an old one revokes the shop's key store and forces a new login.
- **Product subtypes via factory + registry** — shared product fields live in one collection; type-specific fields live in their own collections (`Clothing`, `Electronic`). Adding a type means adding a class and one registration line, not editing the service.
- **Draft/publish lifecycle** — new products start as drafts. Public listing and search only see published products.
- **Search** — MongoDB text index on name and description, sorted by text score.
- **Inventory** — an inventory record is created for every product, with fields ready for reservations.
- **Discount domain** — create, update, and list discount codes with date windows, usage caps, and per-user limits.
- **Consistent responses** — a shared success/error envelope and an `asyncHandler` wrapper, so controllers stay small.
- **Operational basics** — Helmet, compression, request logging, and graceful shutdown that closes both Mongoose and the HTTP server.

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 20+ |
| HTTP | Express 5 |
| Database | MongoDB 7 + Mongoose 9 |
| Auth | JWT (`jsonwebtoken`), bcrypt |
| Tooling | Docker Compose, dotenv |

## Architecture

```
src/
  auth/          # API-key guard, permission check, JWT verify middleware
  routers/       # versioned route modules
  controllers/   # HTTP layer: parse request, shape response
  services/      # business logic: access, product, discount, inventory, keytoken
  models/        # Mongoose schemas
    repositories/# queries and writes, kept out of services
  core/          # error + success response contracts
  dbs/           # singleton Mongo connection
  helpers/       # asyncHandler, connection counter
  utils/         # field selection, nested update parsing
  postman/       # ready-to-run request collections
```

Request lifecycle:

```
route → apiKey → checkPermission("0000") → [authentication] → controller → service → repository → MongoDB
```

The code is split into routes, controllers, services, and repositories so the business rules do not depend on Express or Mongoose. That is what makes the product factory easy to extend and the services testable in isolation.

## Authentication

| Header | Used by | Purpose |
| --- | --- | --- |
| `x-api-key` | every request | identifies the calling client and its permissions |
| `x-client-id` | authenticated requests | shop `_id`; must match the token payload |
| `authorization` | authenticated requests | access token |
| `x-refresh-token` | refresh endpoint | refresh token |

Login generates a key pair, stores it in `keytokens` with the refresh token, and returns both tokens. Protected routes verify the access token with the stored public key and check that the token's `userId` matches `x-client-id`.

On refresh, the token is verified with the private key, compared with the stored refresh token, then rotated: the old token is pushed to `refreshTokenUsed` and a new pair is issued. If a token from `refreshTokenUsed` is presented again, the key store is deleted — the session is treated as compromised.

## Data model

| Collection | Purpose |
| --- | --- |
| `shops` | seller account: name, email, hashed password, roles, status |
| `products` | shared product fields, price, quantity, shop reference, draft/publish flags |
| `clothing` | clothing-specific attributes: brand, size, material |
| `electronics` | electronics-specific attributes: manufacturer, model, color |
| `inventories` | stock per product and shop, plus a reservation list |
| `discounts` | code, type, value, date window, usage limits, applicable products |
| `keytokens` | per-shop public/private key pair, current and used refresh tokens |
| `apiKeys` | client keys and their permission sets |

## API

Base path: `/v1/api`. All routes require `x-api-key`.

### Shop

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/shop/signup` | API key | create a shop `{ name, email, password }` |
| `POST` | `/shop/login` | API key | returns shop info + `{ accessToken, refreshToken }` |
| `POST` | `/shop/logout` | access token | deletes the shop's key store |
| `POST` | `/shop/handle-refresh-token` | refresh token | rotates the token pair |

### Product

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/product?limit=&page=&sort=` | API key | published products, paginated |
| `GET` | `/product/search/:keySearch` | API key | full-text search over published products |
| `GET` | `/product/:id` | API key | product detail |
| `POST` | `/product/create` | access token | create a draft product |
| `PATCH` | `/product/update/:id` | access token | update a product |
| `PATCH` | `/product/publish/:id` | access token | publish a draft |
| `PATCH` | `/product/unpublish/:id` | access token | move a product back to draft |
| `GET` | `/product/drafts` | access token | drafts owned by the shop* |
| `GET` | `/product/published` | access token | published products owned by the shop* |

\* Implemented in the controller, but currently shadowed by `GET /product/:id` because of route order. See Roadmap.

Create product body:

```json
{
  "product_type": "Clothing",
  "product_name": "Oversized cotton tee",
  "product_thumb": "https://example.com/tee.jpg",
  "product_description": "Heavyweight cotton, boxy fit",
  "product_price": 29,
  "product_quantity": 100,
  "product_attributes": {
    "brand": "Demo",
    "size": "L",
    "material": "Cotton"
  }
}
```

## Getting started

Requirements: Node.js 20+, Docker.

```bash
git clone https://github.com/Gressi-177/ecommerce-backend-nodejs.git
cd ecommerce-backend-nodejs
npm install

# Mongo 7 on localhost:27017
docker compose up -d

cp .env.example .env
# edit .env if you use different ports or names
node server.js
```

Seed a development API key (once per database):

```bash
docker exec -it ecommerce-mongodb mongosh shopDEV --eval \
  'db.apiKeys.insertOne({ key: "dev-api-key", status: "true", permissions: ["0000"] })'
```

Smoke test:

```bash
curl -X POST http://localhost:3000/v1/api/shop/signup \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: dev-api-key' \
  -d '{"name":"Demo Shop","email":"demo@shop.dev","password":"secret123"}'
```

## Design decisions

**Factory + registry for product types.** A switch statement in the service would grow with every new category. The registry lets a category own its validation and persistence while the service only routes to it.

**Repository layer.** Services describe intent (`publishProductByShop`, `searchProductsByUser`); repositories own the Mongoose query. Swapping the data store or testing a service does not require mocking Mongoose.

**Refresh-token reuse detection.** Rotating on every refresh limits the damage of a stolen token. Detecting reuse turns a silent compromise into a forced logout.

**Draft/publish flags with `select: false`.** Internal workflow state is excluded from public reads by default instead of relying on every query to remember to hide it.

**MongoDB text index instead of a search service.** At this catalog size, a text index is enough and removes an extra piece of infrastructure. If ranking or typo tolerance becomes a requirement, the repository boundary makes the replacement contained.

## Roadmap

The project is intentionally a work in progress. The next changes, in order:

- [ ] Integration tests for signup, login, refresh rotation, and product publish (Jest + Supertest + `mongodb-memory-server`).
- [ ] Fix route order so `/product/drafts` and `/product/published` resolve before `/:id`.
- [ ] Align the `product_type` enum with the registry (`Electronic` vs `Electronics`).
- [ ] Expose discount and inventory routes, and wrap stock changes in transactions.
- [ ] Request validation at the edge, rate limiting, and no stack traces in production responses.
- [ ] OpenAPI spec + Swagger UI.
- [ ] GitHub Actions CI and a production Dockerfile.
