# SplitEase Server

## Overview

**SplitEase** is a collaborative expense and meal management platform designed for shared living environments such as hostels, messes, or shared apartments. The project aims to simplify the management of shared expenses, meals, and house-related activities by providing a robust backend API. It automates calculations, tracks payments, manages subscriptions, and provides detailed statistics, reducing manual effort and potential disputes among house members.

## Live URLs

- **API Base URL:** [https://splitease-server.vercel.app/]
- **Frontend URL:** [https://splitease-client.vercel.app/]

## Features

- **User Authentication:** Register, login, Google OAuth, password reset, and email verification.
- **Role Management:** Supports Admin, Manager, and Member roles with different permissions.
- **House Management:** Create, update, and manage houses and their members.
- **Expense Tracking:** Add, update, and track expenses by month and house.
- **Meal Management:** Record and manage daily meals for members.
- **Deposits:** Track deposits made by members.
- **Subscription & Plans:** Manage subscription plans and payments.
- **Statistics:** Dashboard and monthly summaries for financial and meal data.
- **Profile Management:** Update user profiles, including image uploads.
- **Robust Access Control:** Middleware-based role and authentication checks.
- **RESTful API:** Well-structured endpoints for all resources.

## Technologies Used

- **Node.js** & **Express.js** (API server)
- **TypeScript** (type safety)
- **Prisma ORM** (database access)
- **PostgreSQL** (database)
- **Cloudinary** (image uploads)
- **Stripe** (payment processing)
- **JWT** (authentication)
- **Zod** (validation)
- **Vercel** (deployment)
- **Other:** Multer, dotenv, etc.

## Project Structure

```
splitease-server/
├── api/                # API server entry
├── postman/            # Postman collection for API testing
├── prisma/             # Prisma schema and migrations
│   └── schema/         # Modular Prisma schema files
├── src/
│   ├── app/
│   │   ├── config/     # Config files (env, cloudinary, stripe, etc.)
│   │   ├── errorHelpers/
│   │   ├── interfaces/
│   │   ├── lib/        # Prisma client, auth helpers
│   │   ├── middleware/ # Auth, error, not found
│   │   ├── modules/    # Feature modules (auth, users, houses, etc.)
│   │   ├── routes/     # Main route aggregator
│   │   ├── scripts/    # Seed scripts
│   │   ├── shared/     # Common utilities
│   │   ├── templates/  # Email templates
│   │   └── utils/      # Utility functions
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── README.md
├── package.json
├── tsconfig.json
└── ...
```

## Database Design

![Database Design](db_design.png)
_See attached image for full ER diagram._

## API Endpoints

All routes are prefixed with `/api/v1/` (or serverless root in some deployments).

**Role Key:**

- **A:** Admin
- **M:** Manager
- **MB:** Member

Some endpoints require authentication and specific roles as indicated.

---

### Auth

| Method | Endpoint                | Description                   | Roles    |
| ------ | ----------------------- | ----------------------------- | -------- |
| POST   | `/auth/register`        | Register manager              |          |
| POST   | `/auth/login`           | User login                    |          |
| POST   | `/auth/logout`          | Logout user                   | A, M, MB |
| POST   | `/auth/change-password` | Change password               | A, M, MB |
| POST   | `/auth/verify-email`    | Verify email (OTP)            |          |
| POST   | `/auth/resend-otp`      | Resend verification OTP       |          |
| POST   | `/auth/forget-password` | Forgot password               |          |
| POST   | `/auth/reset-password`  | Reset password                |          |
| GET    | `/auth/me`              | Get current user profile      | A, M, MB |
| PATCH  | `/auth/profile`         | Update profile info/image     | A, M, MB |
| GET    | `/auth/login/google`    | Google OAuth login            |          |
| GET    | `/auth/google/success`  | Google OAuth callback success |          |
| GET    | `/auth/oauth/error`     | OAuth error                   |          |

---

### Users

| Method | Endpoint                   | Description        | Roles |
| ------ | -------------------------- | ------------------ | ----- |
| GET    | `/users/`                  | Get all users      | A     |
| GET    | `/users/:id`               | Get user by ID     | A     |
| PATCH  | `/users/update-status/:id` | Update user status | A     |
| DELETE | `/users/delete/:id`        | Delete user        | A     |

---

### Houses

| Method | Endpoint             | Description     | Roles |
| ------ | -------------------- | --------------- | ----- |
| GET    | `/houses/`           | Get all houses  | A     |
| POST   | `/houses/`           | Create house    | A, M  |
| GET    | `/houses/my`         | Get my houses   | M, MB |
| GET    | `/houses/:id`        | Get house by ID | A     |
| PATCH  | `/houses/update/:id` | Update house    | A, M  |
| DELETE | `/houses/delete/:id` | Delete house    | A, M  |

---

### Members

| Method | Endpoint                  | Description            | Roles |
| ------ | ------------------------- | ---------------------- | ----- |
| POST   | `/members/`               | Add member to house    | A, M  |
| GET    | `/members/`               | Get all members        | A, M  |
| GET    | `/members/house/:houseId` | Get members of a house | M     |
| GET    | `/members/:id`            | Get member by ID       | A, M  |
| DELETE | `/members/:id`            | Delete member          | A, M  |

---

### Expenses

| Method | Endpoint        | Description           | Roles |
| ------ | --------------- | --------------------- | ----- |
| POST   | `/expenses/`    | Create expense        | M, MB |
| GET    | `/expenses/`    | Get expenses by month | M, MB |
| GET    | `/expenses/:id` | Get expense by ID     | M, MB |
| PATCH  | `/expenses/:id` | Update expense        | M, MB |
| DELETE | `/expenses/:id` | Delete expense        | M, MB |

---

### Meals

| Method | Endpoint               | Description               | Roles |
| ------ | ---------------------- | ------------------------- | ----- |
| POST   | `/meal/`               | Add meal                  | M, MB |
| GET    | `/meal/month/:monthId` | Get all meals for a month | M, MB |
| GET    | `/meal/:id`            | Get meal by ID            | M, MB |
| PATCH  | `/meal/:id`            | Update meal               | M, MB |
| DELETE | `/meal/:id`            | Delete meal               | M, MB |

---

### Deposits

| Method | Endpoint       | Description           | Roles |
| ------ | -------------- | --------------------- | ----- |
| POST   | `/deposit/`    | Create deposit        | M, MB |
| GET    | `/deposit/`    | Get deposits by month | M, MB |
| GET    | `/deposit/:id` | Get deposit by ID     | M, MB |
| PATCH  | `/deposit/:id` | Update deposit        | M, MB |
| DELETE | `/deposit/:id` | Delete deposit        | M, MB |

---

### Plans

| Method | Endpoint     | Description   | Roles |
| ------ | ------------ | ------------- | ----- |
| GET    | `/plans/`    | Get all plans | A, M  |
| POST   | `/plans/`    | Create plan   | A     |
| PATCH  | `/plans/:id` | Update plan   | A     |
| DELETE | `/plans/:id` | Delete plan   | A     |

---

### Subscription

| Method | Endpoint                                 | Description                   | Roles |
| ------ | ---------------------------------------- | ----------------------------- | ----- |
| POST   | `/subscription/initiate-payment/:planId` | Initiate subscription payment | M     |
| GET    | `/subscription/my`                       | Get my subscription           | M, MB |
| GET    | `/subscription/`                         | Get all subscriptions         | A     |

---

### Stats

| Method | Endpoint                  | Description         | Roles    |
| ------ | ------------------------- | ------------------- | -------- |
| GET    | `/stats/dashboard`        | Get dashboard stats | A, M, MB |
| GET    | `/stats/summary/:monthId` | Get monthly summary | M, MB    |

---

### Months

| Method | Endpoint                | Description            | Roles    |
| ------ | ----------------------- | ---------------------- | -------- |
| POST   | `/month/`               | Create month           | M        |
| GET    | `/month/house/:houseId` | Get months for a house | A, M, MB |
| GET    | `/month/:id`            | Get month by ID        | A, M, MB |
| DELETE | `/month/:id`            | Delete month           | A, M     |

---

**Roles Key:**

- **A:** Admin
- **M:** Manager
- **MB:** Member

Note: Some endpoints support all authenticated roles even if not specified.

## Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd splitease-server
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in required values.

4. **Set up the database:**

   ```bash
   pnpm prisma migrate deploy
   ```

5. **Generate Prisma client:**

   ```bash
   pnpm prisma generate
   ```

6. **Seed admin user (optional):**

   ```bash
   pnpm tsx src/app/scripts/seedAdmin.ts
   ```

7. **Start the server:**
   ```bash
   pnpm dev
   ```

## Contribution

Feel free to open issues or submit pull requests for improvements and bug fixes.
