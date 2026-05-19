My details
Name: Maxwell Walker
Student ID: 22187034
Course: Web Development  
Assignment: Part 2

Public URL: https://cabsonline.vercel.app/

- fill this in

Technology Stack:
Framework: Next.js 14
UI Library: React 18
Language: TypeScript
Styling: Tailwind CSS 3
Database: Supabase (PostgreSQL)
Map Provider: Leaflet.js + OpenStreetMap
Geocoding: Nominatim
Deployment: Vercel

How to run and build project locally

Step 1: Install dependencies
npm install

Step 2: Set up environment variables
Create a .env.local file in the project root with the following:
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
ADMIN_PASSWORD=your-admin-password

Step 3: Set up Supabase database
Go to the SQL editor in your Supabase dashboard and run this:

-- Drivers table
create table drivers (
id serial primary key,
name text not null,
phone text not null,
vehicle text not null,
plate text not null,
status text not null default 'available' check (status in ('available', 'busy', 'offline')),
created_at timestamptz default now()
);

-- Bookings table
create table bookings (
id serial primary key,
booking_ref text unique not null,
cname text not null,
phone text not null,
unumber text,
snumber text not null,
stname text not null,
sbname text,
dsbname text,
pickup_date date not null,
pickup_time time not null,
booking_datetime timestamptz default now(),
status text not null default 'unassigned' check (status in ('unassigned', 'assigned', 'in_progress', 'completed')),
driver_id integer references drivers(id),
pickup_lat double precision,
pickup_lng double precision,
estimated_fare numeric(8,2)
);

Then enable Row Level Security (RLS) on both tables in the Supabase dashboard and add a permissive policy for the anon role on each (SELECT, INSERT, UPDATE).

Step 4: Run dev server
npm run dev
Then open http://localhost:3000

Step 5: Build for production
npm run build

### Deploy to Vercel

1. Push the project to a GitHub repository
2. Go to vercel.com and sign in with GitHub
3. Click **New Project** and import your repository
4. Add the three environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSWORD`
5. Click **Deploy**

---

## Admin Access

The `/admin` pages are protected by HTTP Basic Auth middleware.

- **Username:** admin
- **Password:** iDL91e79kXkN

> Note: In a real project these credentials would only exist in environment variables and would never appear in documentation. They are included here solely so markers can access the admin panel.

---

## Microservice API Endpoints

| Method | Endpoint                | Description                               |
| ------ | ----------------------- | ----------------------------------------- |
| POST   | `/api/bookings`         | Create a new booking                      |
| GET    | `/api/bookings`         | List unassigned bookings due within 2 hrs |
| GET    | `/api/bookings/:ref`    | Get a booking and its assigned driver     |
| PATCH  | `/api/bookings/:ref`    | Assign driver or advance booking status   |
| GET    | `/api/drivers`          | List all drivers                          |
| POST   | `/api/drivers`          | Add a new driver                          |
| GET    | `/api/fare?from=X&to=Y` | Get fare estimate between two suburbs     |

---

## Feature Descriptions

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

Admins can add and view drivers. Each driver record includes name, phone number, vehicle description, and plate number. When assigning a booking, admins select a specific driver from a dropdown of available drivers. Assigning a booking automatically sets the driver's status to "busy". When a trip is marked as completed, the driver is automatically returned to "available".

### Feature 4: Fare Estimator

**Location:** `/book` page (embedded in booking form)

After filling in the pickup and destination suburbs, customers click "Get Estimate" to see an approximate fare and distance. The system stores approximate GPS coordinates for all ~170 Auckland suburbs and uses the Haversine formula to calculate straight-line distance, then applies a 35% road overhead and Auckland taxi rates ($3.50 flag fall + $2.80/km, minimum $8.50). Invalid suburb names return an error message rather than a default. The estimate is stored with the booking.

---

## 6. Testing Instructions

### Example Booking References

| BRN      | Customer      | Status      | Route                    |
| -------- | ------------- | ----------- | ------------------------ |
| BRN00001 | Alice Johnson | unassigned  | Auckland CBD → Newmarket |
| BRN00002 | Bob Williams  | assigned    | Mt Eden → Auckland CBD   |
| BRN00003 | Carol Davis   | in_progress | Ponsonby → Parnell       |
| BRN00004 | Dave Lee      | completed   | Manukau → Auckland CBD   |
| BRN00005 | Emma Wilson   | unassigned  | St Heliers → Newmarket   |

### Sample Drivers

| ID  | Name  | Vehicle             | Plate  | Status    |
| --- | ----- | ------------------- | ------ | --------- |
| 1   | Jim   | Toyota Prius 2022   | ABC123 | available |
| 2   | Frank | Honda Civic 2006    | XYZ987 | busy      |
| 3   | Wei   | Nissan Skyline 2002 | NPMRUN | available |

### Test Scenarios

- **Booking form:** Fill all required fields and submit → BRN confirmation shown; open map, click a location → address fields auto-fill; enter "Auckland CBD" and "Newmarket" as suburbs → fare estimate shown
- **Track page:** Enter `BRN00002` → Step 2 active with driver details shown; enter `BRN99999` → "not found" error shown
- **Admin search:** Leave search empty → unassigned bookings due within 2 hours shown; enter `BRN00001` → Alice's booking shown
- **Admin assign:** Search `BRN00001`, select a driver from dropdown, click Assign → status updates to assigned; click "Mark In Progress" → status updates; click "Mark Completed" → driver returns to available
- **Driver management:** Add a new driver → appears in the drivers table immediately
- **Invalid suburb:** Enter a non-Auckland suburb in fare estimator → error message shown instead of default fare
- **Invalid BRN format:** Enter `ABC123` in track or admin search → format error shown

---

## 7. Limitations and Known Issues

- Fare estimates use straight-line distance with a fixed road overhead factor — not real routing or traffic-aware
- Nominatim geocoding (map reverse lookup) is rate-limited to 1 request/second — suitable for demo use only
- The map requires an internet connection to load tiles and perform geocoding
- The status tracker requires manual re-search to refresh — there are no real-time push updates
- The admin Basic Auth password is stored in an environment variable; a production system would use a proper authentication system with user accounts

---

## 8. Reflection on AI-Supported Development Process

I have been using Claude Code in my own time for personal projects and came into this assignment with some familiarity with it. I find it genuinely useful for accelerating development, but I have learned that it requires active direction and verification rather than passive delegation — you still need a solid understanding of system architecture to get anything meaningful out of it.

For this project I used Claude to scaffold the Next.js App Router structure, design the database schema, build the fare calculation system, and develop the UI components. This saved considerable time compared to building everything from scratch, particularly for boilerplate-heavy work like API route setup and form validation. I also drafted a README.md and added everything in, i then got Claude to polish it up and format it.

However, there were several points where I had to intervene or make decisions myself. Claude initially did not add .env.local to .gitignore, which would have exposed my Supabase credentials and admin password if I had pushed to GitHub — I caught this and fixed it. I also made the call to replace the original hardcoded fare lookup table with a proper coordinate-based system covering all ~170 Auckland suburbs, because the original approach returned a flat $30 default for any unrecognised input, which was not acceptable. The Supabase RLS policy configuration was also something I had to understand and complete myself through the dashboard.

Through this process I deepened my understanding of several concepts: how Supabase Row Level Security works and why it matters even with a public anon key, how Next.js App Router API routes are structured, and how middleware can be used to protect routes without modifying individual pages. These are things I understood at a surface level before but now feel confident applying independently.
