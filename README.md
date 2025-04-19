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

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Wrangler CLI (Cloudflare Workers development tool)

### Installation

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

### Database Setup

The API uses Cloudflare D1 for database storage. The database is populated from a reranked CSV file of MITO holders (excluding the top 14 whale wallets):

```bash
node import_to_db.js
```

### Local Development

Start a local development server:
```bash
npm run dev
```

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Project Structure

- `src/index.js` - Main API implementation with all route handlers
- `import_to_db.js` - Script to import data from CSV to Cloudflare D1
- `wrangler.toml` - Cloudflare Workers configuration

## Technical Notes

- The API is built using the [itty-router](https://github.com/kwhitley/itty-router) library for routing.
- Data is stored in Cloudflare D1, a serverless SQL database.
- The database contains holders with their ranks, addresses, and balances (MITO, wMITO, and total).
- The top 14 whale wallets have been excluded from the dataset for a more accurate representation of token distribution.

## License

[MIT](LICENSE)
