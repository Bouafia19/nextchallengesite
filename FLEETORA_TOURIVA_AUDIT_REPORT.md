# Fleetora, Touriva & Shared MongoDB Atlas — Production Audit Report

**Date:** October 23, 2026  
**Audited Systems:**
- Fleetora API (`srv-dbb5ol9jfumc73dao5k0`) & Frontends
- Touriva API (`srv-dbb3a4lg1s2s73e3ll9g`) & Frontends
- Shared MongoDB Atlas Cluster (`cluster0.hzmvepq.mongodb.net`, Project ID: `62f7d2fa2aef25447facd251`)
**Auditor:** Senior Full-Stack, DevOps, Security & QA Auditor  
**Scope:** Read-only production audit (API, Database connectivity, Vulnerability scan, Deployment configurations, Access control, Backup validation).

---

## 1. Executive Summary Across All Systems

### Audit Outcome Summary

| System | Pass | Fail | Warning | Unverified | Overall Posture |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Next Challenge Website & API** | 14 | 4 | 3 | 2 | **Operational but At-Risk (Credential Mismatch)** |
| **Fleetora Platform** | 4 | 1 | 1 | 0 | **Healthy Live Services / High Dependency Vulnerabilities** |
| **Touriva Platform** | 4 | 1 | 1 | 0 | **Healthy Live Services / High Dependency Vulnerabilities** |
| **MongoDB Atlas Cluster & Access** | 2 | 1 | 0 | 1 | **100% Data Restored / Excessive Administrative Privileges** |
| **TOTAL** | **24** | **7** | **5** | **3** | **Production Operational with Key Remediations Required** |

---

## 2. Top 5 Most Important Defects Across All Systems

### 1. [RESOLVED & VERIFIED] Next Challenge Render `MONGODB_URI` Authentication Failure on Service Restart
- **Affected System:** Next Challenge Production API (`srv-dbcguo6i0phs738sose0`).
- **Remediation Executed:** `MONGODB_URI` updated on Render with the verified active Atlas user `next` credential and RFC 3986 percent-encoding. Fresh deploy `dep-dbdppfvb9u1s73b3rlfg` successfully built, deployed, and authenticated.
- **Verification Evidence:** Fresh container `/health` returned HTTP 200 `database: "connected"` at `2026-10-23T17:44:27Z`. `/api/courses` returned 3 active courses. All collections (`contacts`: 1, `enrollments`: 1, `courses`: 3) confirmed intact. Status: **RESOLVED**.

### 2. [HIGH] MongoDB Atlas Application Users Hold Global `atlasAdmin` Privileges
- **Affected System:** MongoDB Atlas Project `62f7d2fa2aef25447facd251`.
- **Evidence:** `db.runCommand({connectionStatus: 1})` for `fleetora_app` and `touriva_app` confirms both hold role `[{role: "atlasAdmin", db: "admin"}]`.
- **Impact:** Total lack of database isolation. A remote code execution or injection flaw in Fleetora allows full compromise or deletion of Touriva and Next Challenge databases.
- **Remediation:** In Atlas Database Access, edit both users to "Specific privileges":
  - `fleetora_app` -> `readWrite` on `fleetora` only.
  - `touriva_app` -> `readWrite` on `touriva` and `touriva_shop` only.

### 3. [HIGH] Fleetora Backend Critical and High Package Vulnerabilities
- **Affected System:** Fleetora API Backend (`fleetora/backend`).
- **Evidence:** `npm audit` reports 6 vulnerabilities:
  - 1 CRITICAL: `tar` (<7.5.7 arbitrary file overwrite via hardlink path traversal).
  - 4 HIGH: `ws` (memory exhaustion DoS), `socket.io-parser` (memory exhaustion), `engine.io` (connection exhaustion DoS), `@mapbox/node-pre-gyp`.
- **Impact:** Denial-of-service against real-time driver tracking and potential arbitrary file creation during extraction.
- **Remediation:** Execute `npm update tar ws socket.io` and test WebSocket real-time fleet tracking.

### 4. [HIGH] Touriva Backend High Severity Dependencies
- **Affected System:** Touriva Tourism API Backend (`touriva/backend`).
- **Evidence:** `npm audit` reports 2 HIGH vulnerabilities:
  - `nodemailer` (GHSA-p6gq-j5cr-w38f: SSRF and arbitrary file read via raw option, GHSA-2x7j-588g-ccc2: quadratic addressparser DoS).
  - `path-to-regexp` (GHSA-j3q9-mxjg-w52f: ReDoS via sequential optional groups).
- **Impact:** Potential SSRF via email delivery and server hang from ReDoS requests.
- **Remediation:** Update `nodemailer` to version `>=10.2.1` and `path-to-regexp` to `>=8.4.0`.

### 5. [MEDIUM] Next Challenge 2.22 MB Logo Asset Transferred on Every Load
- **Affected System:** Next Challenge Frontend (`https://nextchallenge.tech`).
- **Evidence:** Headless Chrome network trace logs `next-challenge-modernized-logo.png` at 2,224,162 bytes (2048px natural width) rendered at 36px–48px client width.
- **Impact:** Degrades mobile web performance, increases LCP latency, and wastes user bandwidth.
- **Remediation:** Replace with an optimized SVG or 96×96 WebP asset (~4 KB).

---

## 3. Fleetora Audit Details

### A. Service & Deployment Configuration
- **Render Service Name:** `fleetora-api`
- **Render Service ID:** `srv-dbb5ol9jfumc73dao5k0`
- **Active Deploy ID:** `dep-dbdp4cvb9u1s73b1kn7g` (Status: `live`)
- **Runtime:** Node.js v24.21.0
- **Environment Variables Present:**
  - `MONGO_URI`: Configured to `cluster0.hzmvepq.mongodb.net/fleetora`
  - `SECRET`: JWT signature secret (43 chars)
  - `CORS_ORIGINS`: `*`
  - `NODE_ENV`: `production`

### B. Live Functional Endpoints
- **Health Check (`https://fleetora-api-93an.onrender.com/health`):**
  - Status: HTTP 200
  - Payload: `{"service":"Fleetora API","status":"UP","node":"v24.21.0","dbState":"connected","timestamp":"2026-10-23T16:59:51.530Z"}`
- **Terms (`/api/terms`):** HTTP 200 (Returns 3 terms documents).
- **Vehicles (`/api/vehicles`):** HTTP 401 Unauthorized (Auth middleware active and enforcing security).

### C. Frontend Web Applications
All 4 client and management applications hosted on Render were verified accessible:
1. `fleetora-web` (`https://fleetora-web.onrender.com`): HTTP 200 (`"Fleetora — Smart Transportation & Logistics"`).
2. `fleetora-admin` (`https://fleetora-admin.onrender.com`): HTTP 200 (`"Fleetora Admin — Operations Platform"`).
3. `fleetora-client` (`https://fleetora-client.onrender.com`): HTTP 200 (`"Fleetora — Customer Dispatch & Freight"`).
4. `fleetora-partner` (`https://fleetora-partner.onrender.com`): HTTP 200 (`"Fleetora Partner — Driver & Carrier Console"`).

---

## 4. Touriva Audit Details

### A. Service & Deployment Configuration
- **Render Service Name:** `touriva-api`
- **Render Service ID:** `srv-dbb3a4lg1s2s73e3ll9g`
- **Active Deploy ID:** `dep-dbdp4j8ae00c73ahctq0` (Status: `live`)
- **Runtime:** Node.js Express 5.x
- **Environment Variables Present:**
  - `MONGO_URI`: Configured to `cluster0.hzmvepq.mongodb.net/touriva`
  - `SECRET`: JWT secret (41 chars)
  - `CORS_ORIGINS`: `*`
  - `NODE_ENV`: `production`

### B. Live Functional Endpoints
- **Health Check (`https://touriva-api.onrender.com/api/health`):**
  - Status: HTTP 200
  - Payload: `{"status":"ok","service":"Touriva Tourism API","uptime":27.2,"database":"connected"}`
- **Wilayas (`/api/wilayas`):** HTTP 200 (Returns 57 Algerian wilayas).
- **Sites (`/api/sites`):** HTTP 200 (Returns 18 tourist sites).
- **Products (`/api/products`):** HTTP 200 (Returns 31 marketplace products).

### C. Frontend Web Applications
All 5 tourism and commerce storefronts hosted on Render were verified accessible:
1. `touriva-web` (`https://touriva-web.onrender.com`): HTTP 200 (`"Touriva — Discover More. Travel Better."`).
2. `touriva-admin` (`https://touriva-admin.onrender.com`): HTTP 200 (`"Touriva — Tourism Management Portal"`).
3. `touriva-shop-web` (`https://touriva-shop-web.onrender.com`): HTTP 200 (`"Touriva Travel Shop & Experiences"`).
4. `touriva-shop-admin` (`https://touriva-shop-admin.onrender.com`): HTTP 200 (`"Touriva Shop — Commerce Administration"`).
5. `touriva-shop-seller-admin` (`https://touriva-shop-seller-admin.onrender.com`): HTTP 200 (`"Touriva Partner & Merchant Portal"`).

---

## 5. Shared MongoDB Atlas Cluster Audit

### A. Infrastructure & Network Topology
- **Cluster Hostname:** `cluster0.hzmvepq.mongodb.net`
- **Atlas Project ID:** `62f7d2fa2aef25447facd251` (`Project 0`)
- **Cloud Provider & Region:** AWS `eu-west-3` (Paris, France)
- **Active Shard Hosts:**
  - `ac-8lbtnvp-shard-00-00.hzmvepq.mongodb.net:27017`
  - `ac-8lbtnvp-shard-00-01.hzmvepq.mongodb.net:27017`
  - `ac-8lbtnvp-shard-00-02.hzmvepq.mongodb.net:27017`
- **Network Latency:** 72.0 ms RTT average, 0% packet loss.

### B. Database & Collection Parity Verification

| Database | Collections Count | Total Documents | Data Integrity Check |
| :--- | :---: | :---: | :--- |
| **`fleetora`** | 8 | 23 | **100% Match** (vehicles: 5, roles: 5, users: 7, terms: 3, billings: 1, trips: 1, companies: 1) |
| **`touriva`** | 26 | 2,351 | **100% Match** (communes: 1542, dairas: 549, wilayas: 57, sites: 18, products: 31, hotels: 18) |
| **`touriva_shop`** | 20 | 144 | **100% Match** (products: 31, wilayas: 57, roles: 23, orders: 11, categories: 8, brands: 5) |
| **`nextchallenge`** | 3 | 5 | **100% Match** (courses: 3, contacts: 1, enrollments: 1) |

### C. Backup Validation
- **Local BSON Snapshots:** Verified present at `/home/next/next projects/BackUps/recovery_20261023/` (54 BSON files, 54 metadata files).
- **Safety Tarball:** Verified intact at `/home/next/next projects/BackUps/recovery_20261023_SAFETY_COPY.tar.gz` (319 KB).

### D. Phase 2 Least-Privilege Role Verification Audit (Empirical Results)
- **Latest Verification Timestamp:** `2026-10-23T19:55:05Z`
- **Audit Tool:** Direct MongoDB Wire Protocol Inspection (`verify_phase2_roles.py`)
- **Observed Roles:**
  - `fleetora_app`: `[{ "role": "atlasAdmin", "db": "admin" }]` (Still retains `atlasAdmin`)
  - `touriva_app`: `[{ "role": "atlasAdmin", "db": "admin" }]` (Still retains `atlasAdmin`)
- **Empirical Isolation Status:** `FAIL (NOT YET SCOPED IN ATLAS UI)`.
  - `fleetora_app` was able to query forbidden databases `touriva` and `nextchallenge`.
  - `touriva_app` was able to query forbidden databases `fleetora` and `nextchallenge`.
- **Application Health Baseline:**
  - Next Challenge: HTTP 200 `connected`
  - Fleetora API: HTTP 200 `UP / connected`
  - Touriva API: HTTP 200 `ok / connected`
  - All applications remain 100% operational with 0 downtime.
- **Root Cause & Atlas Console Requirement:**
  MongoDB Atlas manages database users through its control plane. In the Atlas Web UI modal, adding a "Specific Privilege" row does *not* automatically replace the pre-existing "Built-in Role" (`Atlas admin`). The `Atlas admin` row must be explicitly deleted by clicking the trash can icon (🗑️) next to *Atlas admin*, or the privilege toggle must be switched strictly to *Specific privileges*.

---

## 6. Exact MongoDB Atlas Least-Privilege Action (User Intervention)

Because Atlas database users cannot be modified via MongoDB wire protocol commands (`db.updateUser()`) without Atlas Cloud credentials or web console access, this single scoping action requires 2 minutes in the Atlas Web UI:

### Atlas Console Direct Link:
`https://cloud.mongodb.com/v2/62f7d2fa2aef25447facd251#/security/database/users`

### Step 1: Scope `fleetora_app`
1. Locate `fleetora_app` in the Database Users list and click **Edit** (under Actions).
2. Under **Built-in Role**: Click the **trash can icon (🗑️)** next to `Atlas admin` to remove administrative access.
3. Under **Specific Privileges**:
   - Role: Select `readWrite`
   - Database: Enter `fleetora`
   - Collection: Leave empty (applies to all collections in `fleetora`)
4. Click **Update User**.

### Step 2: Scope `touriva_app`
1. Locate `touriva_app` in the Database Users list and click **Edit** (under Actions).
2. Under **Built-in Role**: Click the **trash can icon (🗑️)** next to `Atlas admin` to remove administrative access.
3. Under **Specific Privileges**:
   - Privilege 1: Role `readWrite`, Database `touriva`, Collection empty.
   - Click **Add Additional Privilege**.
   - Privilege 2: Role `readWrite`, Database `touriva_shop`, Collection empty.
4. Click **Update User**.

> [!CAUTION]
> Do NOT edit or touch the `next` user.
> Do NOT drop, change passwords, or recreate the users. Only modify the assigned privileges.

---

## 7. Comprehensive Security Remediation Execution Evidence

### A. Fleetora Backend (`fleetora/backend`)
- **Dedicated Branch:** `fix/security-deps-20261023`
- **Latest Commit:** `c91e9fe` (`fix(security): remove sensitive user credential logging and enforce 7-day JWT expiration`)
- **Key Remediations:**
  1. **Dependency Vulnerability Remediation (Commit `f58ff56`):**
     - Upgraded `bcrypt` from `^5.1.1` to `^6.0.0`, eliminating `@mapbox/node-pre-gyp` and Critical `tar` vulnerability (hardlink path traversal).
     - Upgraded `socket.io` to `^4.8.4` with overrides for `ws: ^8.21.3`, `engine.io: ^6.6.11`, `socket.io-parser: ^4.2.7`, and `socket.io-adapter: ^2.5.8`.
     - `npm audit`: Reduced from 6 vulnerabilities (1 Critical, 4 High) to **0 vulnerabilities**.
  2. **Sensitive Credential Logging Elimination (Commit `c91e9fe`):**
     - In `models/User.js`: Removed `console.log` statements in `loginPhone` (lines 162-163, 169-170, 181, 185, 191, 195) that were dumping user phone numbers, bcrypt password hashes, and complete user profile documents to standard output and Render production logs.
  3. **JWT Session Expiration (Commit `c91e9fe`):**
     - In `controllers/usersController.js`: Added `{ expiresIn: '7d' }` to `jwt.sign()`, preventing infinitely valid authentication tokens.
- **Verification Evidence:**
  - Automated test suite (`node --test tests/*.test.js`): **12 passed, 0 failed**.
  - Output audit: Zero credentials or sensitive data printed during authentication.

### B. Touriva Backend (`touriva/backend`)
- **Dedicated Branch:** `fix/security-deps-20261023`
- **Latest Commit:** `a5b1257` (`fix(security): require authentication on GET /api/orders and enforce 7-day JWT expiration`)
- **Key Remediations:**
  1. **Dependency Vulnerability Remediation (Commit `126c947`):**
     - Upgraded `nodemailer` from `^7.0.13` to `^10.2.1` (GHSA-p6gq-j5cr-w38f, GHSA-2x7j-588g-ccc2).
     - Added override `path-to-regexp: ^8.4.2` for Express 5 router (GHSA-j3q9-mxjg-w52f ReDoS).
     - `npm audit`: Reduced from 2 High vulnerabilities to **0 vulnerabilities**.
  2. **Critical Broken Authentication Fix (Commit `a5b1257`):**
     - In `routes/orders.js`: Discovered that `router.get('/', getOrders)` was declared *before* `router.use(requireAuth)`. This permitted any unauthenticated caller on the public internet to download all 11 customer orders, phone numbers, and pricing details via `GET /api/orders`.
     - Moved `router.get('/', getOrders)` below `router.use(requireAuth)`.
  3. **JWT Session Expiration (Commit `a5b1257`):**
     - In `controllers/usersController.js`: Added `{ expiresIn: '7d' }` to `jwt.sign()`, enforcing 7-day token expiration.
  4. **Automated Regression Prevention:**
     - In `tests/shop.test.js`: Added test `GET /api/orders rejects unauthenticated requests with 401`.
- **Verification Evidence:**
  - Automated test suite (`jest --detectOpenHandles --forceExit`): **5 suites passed, 28 passed, 0 failed** (increased from 27).

---

## 8. Staged Production Deployment Plan (Pending User Approval)

All code modifications are safely committed to isolated Git branches with passing test suites. Per production safety requirements, no deployment will be triggered without explicit user confirmation.

| Service | Render Service ID | Target Branch | Head Commit | Changes Included | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Next Challenge** | `srv-dbcguo6i0phs738sose0` | `fix/website-ux-seo-20261023` | `18352d0` | Sitemap cleanup, SPA admin title, accessibility focus rings, audit documentation | `/health`, `test-site.js` (10 suites pass) |
| **Fleetora API** | `srv-dbb5ol9jfumc73dao5k0` | `fix/security-deps-20261023` | `c91e9fe` | 0 audit vulnerabilities (`tar`, `ws`, `socket.io`), removed credential logging, 7d JWT expiration | `/health`, 12 unit tests pass |
| **Touriva API** | `srv-dbb3a4lg1s2s73e3ll9g` | `fix/security-deps-20261023` | `a5b1257` | 0 audit vulnerabilities (`nodemailer`, `path-to-regexp`), protected `GET /api/orders`, 7d JWT expiration | `/api/health`, 28 unit tests pass |

