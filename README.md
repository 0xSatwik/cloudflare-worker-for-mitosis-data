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

### GitHub to Cloudflare Deployment

To deploy this project directly from GitHub to Cloudflare:

1. **Create the D1 database first**:
   ```bash
   # Log in to Cloudflare if not already logged in
   wrangler login
   
   # Create the D1 database
   wrangler d1 create mito-holders
   ```

2. **Note the database_id** from the output, which looks like:
   ```
   [[d1_databases]]
   binding = "DB"
   database_name = "mito-holders" 
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

3. **Update wrangler.toml** in your GitHub repository with the correct database_id.

4. **Configure GitHub integration** in your Cloudflare dashboard:
   - Go to Cloudflare Dashboard > Workers & Pages
   - Click "Create Application" > "Connect to Git"
   - Select your repository and configure build settings:
     - Build command: `npm install && npm run build`
     - Build output directory: `dist` (or leave empty if not using a build step)
     - Root directory: `/`

5. **Import the data**:
   - After successful deployment, you still need to populate the database with the holders data.
   - Either run `node import_to_db.js` locally with the `--remote` flag, or import the data through the Cloudflare dashboard.

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