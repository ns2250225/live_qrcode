# Build Dynamic QR Code Platform (Live QR Code)

Based on the provided PRD, I will build the application from scratch using Next.js (App Router), SQLite, and Prisma.

## Phase 1: Infrastructure & Database Setup
1.  **Initialize Project**: Create a new Next.js project with TypeScript, Tailwind CSS, and ESLint.
2.  **Install Dependencies**: Install `prisma`, `@prisma/client`, `bcryptjs` (for password hashing), `jose` (for JWT), `qrcode.react`, and `lucide-react`.
3.  **Database Schema**: 
    *   Initialize Prisma with SQLite.
    *   Define `User` model (email, password, ip, points, referrals).
    *   Define `DynamicCode` model (short_code, type, target, active, visits).
    *   Run initial migration to create the database.

## Phase 2: Authentication & Points System
1.  **Utilities**: Create helpers for password hashing, JWT token generation/verification, and IP extraction.
2.  **API Routes**:
    *   `POST /api/auth/register`: Handle registration with IP uniqueness check, password hashing, referral code logic (+10 points to inviter), and initial points (20).
    *   `POST /api/auth/login`: Validate credentials and set HTTP-only cookie with JWT.
    *   `POST /api/auth/logout`: Clear auth cookie.
3.  **Middleware**: Implement `middleware.ts` to protect `/dashboard` routes and redirect unauthenticated users.

## Phase 3: Core Business Logic (Backend)
1.  **QR Code Management APIs**:
    *   `POST /api/qrcode/create`: Handle Link/Image input, upload image (to `public/uploads`), generate unique short code, deduct 10 points.
    *   `GET /api/qrcode/list`: Fetch user's QR codes.
    *   `PUT /api/qrcode/[id]`: Update target content.
2.  **Redirect System**:
    *   Implement dynamic route `/q/[code]`.
    *   Logic: Lookup code -> Record visit (optional) -> 302 Redirect to target URL.

## Phase 4: Frontend Implementation
1.  **UI Components**: Set up basic UI components (Buttons, Inputs, Cards) using Tailwind (and Shadcn/ui concepts).
2.  **Pages**:
    *   **Landing (`/`)**: Introduction and links to Login/Register.
    *   **Auth (`/login`, `/register`)**: Forms for authentication.
    *   **Dashboard (`/dashboard`)**: Display user points, list of QR codes.
    *   **Create/Edit (`/dashboard/create`, `/dashboard/edit/[id]`)**: Form to create/update QR codes with toggle for Link/Image mode.
    *   **Profile (`/profile`)**: Display referral link and simple stats.
3.  **QR Display**: Use `qrcode.react` to render QR codes for the short links (e.g., `domain/q/abc`).

## Phase 5: Verification
1.  Verify registration fails for duplicate IP.
2.  Verify points deduction on creation and blocking when points < 10.
3.  Verify referral points logic.
4.  Test QR code scanning and redirection.
