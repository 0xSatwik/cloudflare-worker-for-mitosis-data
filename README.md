# MITO Holders API

A Cloudflare Workers API for accessing reranked MITO token holders data. This API provides information about wallets, balances, rankings, and overall distribution statistics.

## Features

- 🔍 **Wallet Lookup**: Search any wallet address to find its rank and token balances
- 📊 **Flexible Browsing**: View holders by rank ranges, paginated lists, or top-N lists
- 📈 **Distribution Stats**: Get comprehensive statistics on token distribution
- ⚡ **Fast Performance**: Built on Cloudflare's global edge network
- 🌐 **CORS Enabled**: Ready for cross-origin requests from web applications

## Live API

The API is deployed and accessible at:
[https://mito-api.customrpc.workers.dev/](https://mito-api.customrpc.workers.dev/)

## API Endpoints

### Wallet Information
```
GET /api/wallet/:address
```
Get detailed information about a specific wallet address, including its rank and balances.

### Paginated Holders List
```
GET /api/holders?page=1&limit=50
```
Get a paginated list of all token holders sorted by rank.

### Rank Range Query
```
GET /api/range/:from/:to
```
Get holders within a specific rank range (maximum range size: 10,000 positions).

### Top N Holders
```
GET /api/top/:count
```
Get the top N holders by rank.

### Overall Statistics
```
GET /api/stats
```
Get comprehensive statistics about token distribution.

## Deployment Options

### 1. Deploy via Cloudflare Dashboard (Recommended)

This repository includes a **`mito-holders-backup.sql`** file containing the database schema and data. You can deploy directly from GitHub using the Cloudflare Dashboard.

See [DEPLOY.md](DEPLOY.md) for detailed step-by-step instructions.

### 2. Manual Setup (Alternative)

If you prefer to set up manually:

#### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Wrangler CLI (Cloudflare Workers development tool)

#### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/mito-holders-api.git
cd mito-holders-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up Wrangler:
```bash
npm install -g wrangler
wrangler login
```

#### Database Setup

There are two ways to set up the database:

**Option A: Import from SQL backup:**
```bash
# Create a new D1 database
npx wrangler d1 create mito-holders

# Import the provided SQL backup
npx wrangler d1 import mito-holders --file=mito-holders-backup.sql --remote
```

**Option B: Import from CSV (if you have the original CSV):**
```bash
# Run the import script
node import_to_db.js
```

#### Local Development

Start a local development server:
```bash
npm run dev
```

#### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Project Structure

- `src/index.js` - Main API implementation with all route handlers
- `import_to_db.js` - Script to import data from CSV to Cloudflare D1
- `wrangler.toml` - Cloudflare Workers configuration
- `mito-holders-backup.sql` - Full database backup for easy deployment

## Technical Notes

- The API is built using the [itty-router](https://github.com/kwhitley/itty-router) library for routing.
- Data is stored in Cloudflare D1, a serverless SQL database.
- The database contains holders with their ranks, addresses, and balances (MITO, wMITO, and total).
- The top 14 whale wallets have been excluded from the dataset for a more accurate representation of token distribution.

## License

[MIT](LICENSE)
