# CabsOnline — Part 2 Web Application

## Student Information

Course: Web Application Development  
Part: Part 2 — AI-Assisted Refactoring with Modern Frameworks

---

## 1. Public URL of the Deployed Application

> **https://cabsonline-[yourname].vercel.app**  
> Replace with your actual Vercel URL after deployment (see Section 3).

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Database | Supabase (PostgreSQL) |
| Map Provider | Leaflet.js 1.9 + OpenStreetMap |
| Geocoding | Nominatim (free, no API key) |
| Deployment | Vercel |

---

## 3. How to Run and Build the Project Locally

**Prerequisites:** Node.js 18+, npm

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up environment variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

To get these values:
1. Sign up at https://supabase.com
2. Create a new project (select **Australia Southeast** region)
3. Go to **Settings > API** and copy the Project URL and anon public key

### Step 3 — Set up the Supabase database
Go to your Supabase project → **SQL Editor → New Query** and run:

```sql
CREATE TABLE drivers (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(15)  NOT NULL,
  vehicle    VARCHAR(100) NOT NULL,
  plate      VARCHAR(20)  NOT NULL UNIQUE,
  status     VARCHAR(20)  NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id               SERIAL PRIMARY KEY,
  booking_ref      VARCHAR(10)  NOT NULL UNIQUE,
  cname            VARCHAR(100) NOT NULL,
  phone            VARCHAR(15)  NOT NULL,
  unumber          VARCHAR(10),
  snumber          VARCHAR(10)  NOT NULL,
  stname           VARCHAR(100) NOT NULL,
  sbname           VARCHAR(100),
  dsbname          VARCHAR(100),
  pickup_date      DATE         NOT NULL,
  pickup_time      TIME         NOT NULL,
  booking_datetime TIMESTAMPTZ  NOT NULL DEFAULT now(),
  status           VARCHAR(20)  NOT NULL DEFAULT 'unassigned',
  driver_id        INTEGER      REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_lat       DOUBLE PRECISION,
  pickup_lng       DOUBLE PRECISION,
  estimated_fare   NUMERIC(8,2)
);

ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE drivers  DISABLE ROW LEVEL SECURITY;
```

### Step 4 — Seed sample data (recommended for testing)
```sql
INSERT INTO drivers (name, phone, vehicle, plate, status) VALUES
  ('John Smith',   '0211234567', 'Toyota Camry 2022',   'ABC123', 'available'),
  ('Maria Garcia', '0219876543', 'Hyundai Sonata 2021', 'XYZ789', 'available'),
  ('Wei Zhang',    '0215551234', 'Kia Optima 2023',     'DEF456', 'busy');

INSERT INTO bookings (booking_ref, cname, phone, snumber, stname, sbname, dsbname, pickup_date, pickup_time, status, estimated_fare) VALUES
  ('BRN00001', 'Alice Johnson', '0211112222', '42',  'Queen Street',     'Auckland CBD', 'Newmarket',    CURRENT_DATE+1, '09:00', 'unassigned',  18.50),
  ('BRN00002', 'Bob Williams',  '0213334444', '15',  'Dominion Road',    'Mt Eden',      'Auckland CBD', CURRENT_DATE+1, '14:30', 'assigned',    22.00),
  ('BRN00003', 'Carol Davis',   '0215556666', '7',   'Ponsonby Road',    'Ponsonby',     'Parnell',      CURRENT_DATE+1, '11:00', 'in_progress', 15.00),
  ('BRN00004', 'Dave Lee',      '0217778888', '100', 'Great South Road', 'Manukau',      'Auckland CBD', CURRENT_DATE+2, '08:00', 'completed',   45.00),
  ('BRN00005', 'Emma Wilson',   '0219990000', '3',   'Beach Road',       'St Heliers',   'Newmarket',    CURRENT_DATE,   '16:00', 'unassigned',  25.00);

UPDATE bookings SET driver_id = 1 WHERE booking_ref = 'BRN00002';
```

### Step 5 — Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Step 6 — Build for production
```bash
npm run build
```

### Deploy to Vercel
1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **New Project** and import your repository
4. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
5. Click **Deploy**

---

## 4. Microservice API Endpoints

### Legacy Microservice API (Part 1 — PHP, AUT webdev server)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/booking.php` | Create a booking (multipart/form-data) |
| POST | `/admin.php` (action=search) | Search bookings by BRN or list upcoming |
| POST | `/admin.php` (action=assign) | Assign a taxi to a booking |

### New Next.js API (Part 2 — Vercel)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking (JSON) |
| GET | `/api/bookings/:ref` | Get booking + driver by BRN |
| PATCH | `/api/bookings/:ref` | Update booking status/driver |
| POST | `/api/admin/search` | Admin search (mirrors PHP admin) |
| POST | `/api/admin/assign` | Assign a specific driver to a booking |
| GET | `/api/drivers` | List all drivers |
| POST | `/api/drivers` | Add a new driver |
| GET | `/api/fare?from=X&to=Y` | Get fare estimate between two suburbs |

---

## 5. Feature Descriptions

### Feature 1: Map-Based Pickup Selection
**Location:** `/book` page

The booking form includes an optional Leaflet.js map powered by OpenStreetMap tiles. The user can click **"Use map to set pickup location"** to reveal the map, then click anywhere to drop a pin. The system reverse-geocodes the clicked coordinates using the Nominatim API and automatically fills in the street number, street name, and suburb fields. Coordinates are also stored with the booking.

### Feature 2: Live Booking Status Tracker
**Location:** `/track` page

Customers enter their booking reference (e.g. `BRN00001`) to view the current trip status as a 4-step progress indicator:
1. **Booking Received** — booking confirmed, awaiting driver
2. **Driver Assigned** — a driver has been assigned
3. **In Progress** — trip is underway
4. **Completed** — trip finished

Once a driver is assigned, a driver info card appears showing name, phone, vehicle, and plate number.

### Feature 3: Driver Management System
**Location:** `/admin/drivers` page

Admins can view all registered drivers in a table (name, phone, vehicle, plate, status). A form allows adding new drivers. On the main admin page, the assign flow now shows a **dropdown of available drivers** so admins select a specific driver rather than just clicking a generic "Assign" button. Assigning a booking automatically marks the driver as **busy**.

### Feature 4: Fare Estimator
**Location:** `/book` page (embedded in booking form)

After filling in the pickup suburb and destination suburb, customers can click **"Get Estimate"** to see an approximate fare and distance. The system uses a hardcoded Auckland suburb-to-suburb rate table (~30 pairs). The estimate is stored with the booking as `estimated_fare`.

---

## 6. Testing Instructions

### Example Booking References
| BRN | Customer | Status | Route |
|---|---|---|---|
| BRN00001 | Alice Johnson | unassigned | Auckland CBD → Newmarket |
| BRN00002 | Bob Williams | assigned (John Smith) | Mt Eden → Auckland CBD |
| BRN00003 | Carol Davis | in_progress | Ponsonby → Parnell |
| BRN00004 | Dave Lee | completed | Manukau → Auckland CBD |
| BRN00005 | Emma Wilson | unassigned | St Heliers → Newmarket |

### Sample Driver IDs
| ID | Name | Vehicle | Plate | Status |
|---|---|---|---|---|
| 1 | John Smith | Toyota Camry 2022 | ABC123 | available |
| 2 | Maria Garcia | Hyundai Sonata 2021 | XYZ789 | available |
| 3 | Wei Zhang | Kia Optima 2023 | DEF456 | busy |

### Test Scenarios
- **Booking form:** Submit with all fields → confirm BRN returned; click map → address auto-fills; enter "Auckland CBD" + "Newmarket" → estimate shows $18.50
- **Track page:** Enter `BRN00002` → Step 2 active, John Smith's details shown; `BRN99999` → "not found" error
- **Admin search:** Empty search → unassigned bookings within next 2 hours; `BRN00001` → Alice's booking
- **Admin assign:** Search `BRN00001`, select Maria Garcia, click Assign → status changes to assigned
- **Driver management:** Add new driver → appears in list; duplicate plate → error

---

## 7. Limitations and Known Issues

- Fare estimates are suburb-level flat rates (hardcoded) — not real routing or traffic-aware
- No authentication on the admin panel (demo scope only)
- Nominatim geocoding is rate-limited to 1 req/sec — fine for demo, not for production
- Part 1 (PHP/MySQL) and Part 2 (Next.js/Supabase) use separate databases — data is not shared between them
- The map requires an internet connection to load tiles and perform geocoding
- No real-time push updates — status tracker requires manual re-submit to refresh
- Driver status is not automatically reset to "available" after a trip completes

---

## 8. Reflection on AI-Supported Development Process

This application was developed with the assistance of **Claude Code** (Anthropic), an AI coding assistant.

**Planning:** The AI helped design the full project architecture — technology stack selection, database schema extensions, API route structure, and component breakdown — before any code was written. This upfront planning prevented architectural issues from being discovered mid-implementation.

**Code Generation:** Boilerplate code (API route handlers, form validation, TypeScript interfaces, Tailwind layouts) was generated by the AI. This was particularly efficient for repetitive patterns like input validation and JSON error handling.

**Problem Solving:** The AI identified several non-obvious issues:
- Leaflet requires `{ ssr: false }` dynamic import in Next.js (it accesses `window`/`document` which don't exist server-side)
- TypeScript doesn't recognise `.css` files as modules — a declaration file was needed
- Nominatim requires a `User-Agent` header or requests may be rejected

**Limitations:** AI-generated code required verification. For example, the initial Leaflet CSS import approach failed TypeScript type checking at build time. Running `npm run build` after each major addition was essential for catching these issues.

**Overall:** AI assistance significantly accelerated development, particularly for unfamiliar parts of the stack. It worked best as a collaborator with human oversight — reviewing plans before implementation and verifying build output were critical steps.
