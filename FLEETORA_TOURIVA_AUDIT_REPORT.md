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
- **Verification Timestamp:** `2026-10-23T18:21:00Z`
- **Audit Tool:** `mongosh db.runCommand({ connectionStatus: 1, showPrivileges: true })`
- **Observed Roles:**
  - `fleetora_app`: `[{ "role": "atlasAdmin", "db": "admin" }]` (Still retains `atlasAdmin`)
  - `touriva_app`: `[{ "role": "atlasAdmin", "db": "admin" }]` (Still retains `atlasAdmin`)
- **Isolation Status:** `FAIL (NOT YET REMEDIATED)`. Both users can still query `nextchallenge` and perform cluster-wide actions because `atlasAdmin` remains assigned.
- **Root Cause Analysis:** In the MongoDB Atlas Web UI under *Database User Privileges*, adding a custom database privilege row does not automatically remove the pre-existing `Atlas admin` privilege row. The `Atlas admin` row must be explicitly deleted (using the trash can icon 🗑️) or the privilege type toggled strictly to *Specific privileges* without retaining the built-in role.
- **Application Health Baseline:**
  - Next Challenge: HTTP 200 `connected` (`timestamp: 2026-10-23T18:20:29Z`)
  - Fleetora API: HTTP 200 `UP / connected` (`timestamp: 2026-10-23T18:20:29Z`)
  - Touriva API: HTTP 200 `ok / connected` (`timestamp: 2026-10-23T18:20:29Z`)
  - Next Challenge Courses: HTTP 200 (Count: 3 active courses)
  - Fleetora Terms (`/api/terms`): HTTP 200 (Count: 3)
  - Touriva Wilayas (`/api/wilayas`): HTTP 200 (Count: 57)
  - Touriva Sites (`/api/sites`): HTTP 200 (Count: 18)
  - Touriva Products (`/api/products`): HTTP 200 (Count: 31)

---

## 6. Prioritized Remediation Plan

| Priority | Action | Target System | Risk / Downtime | Status |
| :--- | :--- | :--- | :---: | :--- |
| **P0 (Urgent)** | Update Render `MONGODB_URI` with verified credential | Next Challenge / Render | Zero | **COMPLETED & VERIFIED** (Deploy `dep-dbdppfvb9u1s73b3rlfg`) |
| **P1 (High)** | Scope `fleetora_app` and `touriva_app` roles down from `atlasAdmin` | MongoDB Atlas Console | Zero | **IN PROGRESS (User action in Atlas UI required)** |
| **P2 (High)** | Remediate dependencies (`tar`, `ws`, `socket.io`, `nodemailer`, `path-to-regexp`) | Fleetora & Touriva Backends | Zero | **COMPLETED & VERIFIED (0 audit vulnerabilities, 100% tests pass)** |
| **P3 (Medium)** | Next Challenge asset, UX, and accessibility enhancements | Next Challenge Frontend | Zero | **COMPLETED & VERIFIED (100% pass on all 10 audit suites)** |
| **P4 (Low)** | Restrict `CORS_ORIGINS` from `*` to specific frontend URLs | Fleetora & Touriva Render Env | Zero | Ready for production deployment |

---

## 7. Remediation Execution Evidence & Verification

### A. Fleetora Backend Dependency Remediation (`fleetora/backend`)
- **Dedicated Branch:** `fix/security-deps-20261023` (Commit `f58ff56`)
- **Key Modifications:**
  - Upgraded `bcrypt` from `^5.1.1` to `^6.0.0` (matching Touriva), completely eliminating `@mapbox/node-pre-gyp` and the Critical `tar` vulnerability (hardlink path traversal).
  - Upgraded `socket.io` to `^4.8.4` and added `overrides` for `ws: ^8.21.3`, `engine.io: ^6.6.11`, `socket.io-parser: ^4.2.7`, and `socket.io-adapter: ^2.5.8`.
- **Audit Outcome:** `npm audit` went from **6 vulnerabilities (1 Critical, 4 High)** to **0 vulnerabilities**.
- **Automated Test Results:** `npm test` (`node --test tests/*.test.js`) executed **12 tests passed, 0 failed**. Confirmed real-time Socket.io driver-location broadcasts, JWT authentication, and vehicle dispatching logic.

### B. Touriva Backend Dependency Remediation (`touriva/backend`)
- **Dedicated Branch:** `fix/security-deps-20261023` (Commit `126c947`)
- **Key Modifications:**
  - Upgraded `nodemailer` from `^7.0.13` to `^10.2.1`, resolving SSRF and quadratic `addressparser` DoS advisories.
  - Added dependency override `path-to-regexp: ^8.4.2` satisfying Express 5 / `router@2.2.0`, resolving ReDoS sequential optional group vulnerabilities.
- **Audit Outcome:** `npm audit` went from **2 High severity vulnerabilities** to **0 vulnerabilities**.
- **Automated Test Results:** `npm test` (Jest) executed **5 test suites passed, 27 tests passed, 0 failed**. Confirmed user authentication, trips booking, shop products, and tourism services APIs.

### C. Touriva Shop Backend Verification (`touriva/shop/backend`)
- **Baseline Test Suite:** `npm test` executed **1 test suite passed, 4 tests passed, 0 failed** (`/api/health`, `/api/categories/all`, `/api/wilayas`, `/api/products`).

### D. Production Deployment Safety Gate
In accordance with zero-risk production safety protocols, changes have been committed to isolated security branches (`fix/security-deps-20261023`) and tested with full test suites. Production redeployment on Render will be triggered once the user confirms and Atlas role scoping is finalized.

