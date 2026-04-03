# Centra: Global Financial Ledger & Dashboard API

A high-performance, enterprise-grade financial dashboard API built for global ledger management. This system is engineered for high concurrency, absolute data integrity, and sub-millisecond dashboard performance through strategic architectural choices.

[Live Demo - centra.vishwakarma.pro](https://centra.vishwakarma.pro)

## 1. Project Overview & Context

Centra serves as a centralized financial backbone for global organizations, providing real-time visibility into complex transaction streams. Designed with an "Audit-First" philosophy, the API ensures that every financial movement is tracked with precision while maintaining a responsive user experience that scales seamlessly to millions of records.

## 2. Architecture & Decisions

### Prerequisites

- Node.js v20+
- Docker & Docker Compose

### Security & RBAC (Role-Based Access Control)

Security is implemented using a robust JWT-based authentication layer, leveraged via custom NestJS Guards and Method Decorators.

| Role        | Permissions                                                                         |
| :---------- | :---------------------------------------------------------------------------------- |
| **Viewer**  | Read-only access to the dashboard and financial data.                               |
| **Analyst** | Read access + ability to view specific categories and payments. No mutation rights. |
| **Admin**   | Full CRUD access, user management, and system-wide configuration.                   |

### Default Credentials

For testing purposes, the following accounts are available after seeding:

| Role        | Username  | Password      |
| :---------- | :-------- | :------------ |
| **Admin**   | `Admin`   | `password123` |
| **Analyst** | `Analyst` | `password123` |
| **Viewer**  | `Viewer`  | `password123` |

### Hybrid Data Strategy (Normalized + Denormalized)

To achieve instant dashboard loading times, we employ a hybrid strategy:

- **Normalized Data:** Payments and categories are stored in standard normalized tables to ensure data integrity and flexibility.
- **Denormalized Ledger:** We utilize a singleton `GlobalLedger` table that stores pre-aggregated all-time statistics. This allows for **O(1) retrieval** of top-level metrics without expensive `SUM()` operations across millions of rows.
- **Atomic Synchronization:** The ledger is updated within Prisma `$transaction` blocks using atomic database-level operations (`increment`/`decrement`). This prevents race conditions in high-concurrency environments, ensuring the ledger remains consistent with individual payment records.

### Time-Series Graphing

Weekly and monthly trends are computed using **Raw SQL** optimized with PostgreSQL's `DATE_TRUNC`.

- **Performance:** SQL-level aggregation is significantly faster than application-level processing for large datasets.
- **Security:** All raw queries utilize `Prisma.sql` templates to strictly enforce parameterization and prevent SQL injection.

### Cursor-Based Pagination

The `GET /payments` endpoint implements **Cursor-Based Pagination** instead of traditional Offset/Skip.

- **Scalability:** Offset pagination degrades to $O(N)$ as users navigate deeper into the dataset.
- **Performance:** Our cursor implementation maintains **O(1) performance** regardless of depth, as it utilizes indexed comparisons rather than skipping rows, making the system future-proof for datasets exceeding millions of entries.

### Revert-and-Apply Update Pattern

To handle complex updates—such as changing a payment from an `Income` type to an `Expense` type—the system employs a **Revert-and-Apply** pattern. Within a single transaction:

1.  The old value is "reverted" from the global ledger.
2.  The payment record is updated.
3.  The new value is "applied" to the ledger.
    This ensures the ledger math remains flawless even during radical state transitions.

## 3. Tech Stack & Infrastructure

- **Backend:** NestJS (TypeScript) - Chosen for its modular architecture and enterprise-ready DI system.
- **Database:** PostgreSQL with Prisma ORM.
- **Infrastructure:**
  - **Docker:** Multi-stage builds for optimized image sizes and security.
  - **Nginx Gateway:** Operates as a high-performance reverse proxy and static file server. Nginx serves the compiled Vue.js SPA directly, keeping the Node.js event loop focused exclusively on API logic.
  - **Deployment:** Orchestrated via Railway with automated CI/CD pipelines.
