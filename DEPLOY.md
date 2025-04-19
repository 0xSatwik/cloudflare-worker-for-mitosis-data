# Deployment Guide

This guide explains how to deploy this project using the Cloudflare Dashboard directly from GitHub.

## Prerequisites

- A Cloudflare account
- GitHub account with this repository

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

### Step 1: Deploy the Worker

1. Log in to your Cloudflare account
2. Go to **Workers & Pages** in the sidebar
3. Click **Create application**
4. Select **Connect to Git**
5. Connect to your GitHub account and select this repository
6. In the setup page:
   - Set the project name (e.g., "mito-api")
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Entry point: `src/index.js`
7. Click **Save and Deploy**

### Step 2: Create the D1 Database

1. Go to **Workers & Pages** → **D1**
2. Click **Create database** and name it "mito-holders"
3. Once created, go to the **SQL editor** tab
4. Click **Import** and upload the `mito-holders-backup.sql` file included in this repository
5. Click **Run query** to import the database

### Step 3: Connect the Database to Your Worker

1. Go to **Workers & Pages** → find your deployed worker
2. Click on your worker → **Settings** → **Variables**
3. Scroll to **D1 Database Bindings**
4. Click **Add binding**:
   - Variable name: `DB` (must match what's in the code)
   - Database: select your "mito-holders" database
5. Click **Save** and deploy again

## Option 2: Direct Deploy Using Wrangler CLI

If you prefer to deploy directly using the Wrangler CLI:

1. Clone this repository and navigate to the project directory
2. Install dependencies: `npm install`
3. Log in to Cloudflare: `npx wrangler login`
4. Create a D1 database: `npx wrangler d1 create mito-holders`
5. Update the `wrangler.toml` file with your database ID
6. Import the database: `npx wrangler d1 import mito-holders --file=mito-holders-backup.sql --remote`
7. Deploy the worker: `npm run deploy`

## Testing the Deployment

Visit your worker's URL (e.g., `https://mito-api.username.workers.dev/`) to verify the API is working correctly.

All endpoints should now be available:
- `/api/wallet/:address`
- `/api/holders?page=1&limit=50`
- `/api/range/:from/:to`
- `/api/top/:count`
- `/api/stats`

## Troubleshooting

If your API returns a 500 error with "Cannot read properties of undefined (reading 'DB')", check that:
1. The D1 database binding is correctly set up
2. The binding variable name is exactly `DB`
3. The database is fully imported with the "holders" table 