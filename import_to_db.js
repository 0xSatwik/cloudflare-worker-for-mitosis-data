const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const inputFile = 'reranked_holders.csv';
  
  // Check if the file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`Error: ${inputFile} not found! Please run the reranking script first.`);
    return;
  }
  
  console.log(`Importing data from ${inputFile} to D1 database...`);
  
  // Create D1 database
  console.log('Creating D1 database...');
  try {
    const createDbOutput = execSync('npx wrangler d1 create mito-holders').toString();
    console.log(createDbOutput);
    
    // Extract database ID from output
    const dbIdMatch = createDbOutput.match(/database_id\s*=\s*"([^"]+)"/);
    if (!dbIdMatch) {
      console.error('Failed to extract database ID');
      return;
    }
    
    const dbId = dbIdMatch[1];
    console.log(`Database ID: ${dbId}`);
    
    // Update wrangler.toml with the actual database ID
    let wranglerConfig = `
name = "mito-api"
main = "src/index.js"
compatibility_date = "2023-10-02"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "mito-holders"
database_id = "${dbId}"
`;
    
    fs.writeFileSync('wrangler.toml', wranglerConfig);
    console.log('Created wrangler.toml with database configuration');
    
  } catch (error) {
    console.error('Error creating database:', error.message);
    return;
  }
  
  // Create schema
  console.log('Creating database schema...');
  fs.writeFileSync('schema.sql', `
    DROP TABLE IF EXISTS holders;
    CREATE TABLE holders (
      rank INTEGER PRIMARY KEY,
      address TEXT NOT NULL,
      mito_balance REAL,
      wmito_balance REAL,
      total_balance REAL
    );
    
    CREATE INDEX idx_address ON holders(address);
    CREATE INDEX idx_total_balance ON holders(total_balance DESC);
  `);
  
  try {
    // Execute schema creation against the REMOTE database
    console.log('Applying schema to remote database...');
    execSync('npx wrangler d1 execute mito-holders --file=schema.sql --remote');
    console.log('Schema created successfully on remote database');
  } catch (error) {
    console.error('Error creating remote schema:', error.message);
    return;
  }
  
  // Read and process the CSV file
  console.log('Processing CSV data...');
  const csvData = fs.readFileSync(inputFile, 'utf8');
  const lines = csvData.split('\n');
  
  // Clean the header row and get column names
  const headerLine = lines[0].trim();
  const headers = headerLine.split(',').map(h => h.trim().replace(/\r/g, ''));
  
  console.log('CSV Headers found:', headers);
  
  // Find column indices
  const rankIdx = headers.indexOf('rank');
  const addressIdx = headers.indexOf('address');
  const mitoIdx = headers.indexOf('mito_balance');
  const wmitoIdx = headers.indexOf('wmito_balance');
  const totalIdx = headers.indexOf('total_balance');
  
  if (rankIdx === -1 || addressIdx === -1 || mitoIdx === -1 || wmitoIdx === -1 || totalIdx === -1) {
    console.error('Error: Required columns not found in the CSV file');
    console.log('Headers found:', headers);
    console.log('Looking for: rank, address, mito_balance, wmito_balance, total_balance');
    return;
  }
  
  console.log(`Column indices - rank: ${rankIdx}, address: ${addressIdx}, mito: ${mitoIdx}, wmito: ${wmitoIdx}, total: ${totalIdx}`);
  
  // Prepare SQL statements in batches
  const batchSize = 10000;
  let insertStatements = [];
  let batchNumber = 1;
  let processedRows = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split the line by comma and handle potential quoted values
    const values = line.split(',').map(v => v.trim());
    
    // Make sure we have enough values
    if (values.length <= Math.max(rankIdx, addressIdx, mitoIdx, wmitoIdx, totalIdx)) {
      continue;
    }
    
    const rank = parseInt(values[rankIdx]) || 0;
    const address = values[addressIdx].trim();
    
    // Skip empty addresses
    if (!address) continue;
    
    const mitoBalance = parseFloat(values[mitoIdx]) || 0;
    const wmitoBalance = parseFloat(values[wmitoIdx]) || 0;
    const totalBalance = parseFloat(values[totalIdx]) || 0;
    
    insertStatements.push(
      `INSERT INTO holders (rank, address, mito_balance, wmito_balance, total_balance) 
      VALUES (${rank}, '${address.replace(/'/g, "''")}', ${mitoBalance}, ${wmitoBalance}, ${totalBalance});`
    );
    
    processedRows++;
    
    // Process in batches
    if (insertStatements.length >= batchSize) {
      processBatch(insertStatements.join('\n'), batchNumber);
      insertStatements = [];
      batchNumber++;
    }
  }
  
  // Process any remaining statements
  if (insertStatements.length > 0) {
    processBatch(insertStatements.join('\n'), batchNumber);
  }
  
  console.log(`Processed ${processedRows} rows from CSV file`);
  
  // Create API implementation
  createApiImplementation();
  
  console.log('Database import complete!');
}

function processBatch(sqlStatements, batchNumber) {
  console.log(`Processing batch ${batchNumber} for remote database...`);
  fs.writeFileSync(`batch${batchNumber}.sql`, sqlStatements);
  
  try {
    // Execute batch import against the REMOTE database
    execSync(`npx wrangler d1 execute mito-holders --file=batch${batchNumber}.sql --remote`);
    console.log(`Batch ${batchNumber} imported successfully to remote database`);
  } catch (error) {
    console.error(`Error importing batch ${batchNumber} to remote database:`, error.message);
  }
  
  // Clean up
  fs.unlinkSync(`batch${batchNumber}.sql`);
}

function createApiImplementation() {
  // Create directory structure
  if (!fs.existsSync('src')) {
    fs.mkdirSync('src');
  }
  
  // Create main API file
  const apiCode = `
import { Router } from 'itty-router';

// Create router
const router = Router();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function to create a response
function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// Error handler
function handleError(error) {
  console.error("API Error:", error);
  return createResponse({
    success: false,
    error: error.message || "An unknown error occurred"
  }, 500);
}

// Root route for API info
router.get('/', () => {
  return createResponse({
    api: "MITO Holders API",
    version: "1.0.0",
    endpoints: [
      "/api/wallet/:address - Get data for a specific wallet",
      "/api/holders - Get paginated list of holders (query params: page, limit)",
      "/api/range/:from/:to - Get holders in a specific rank range",
      "/api/top/:count - Get top N holders",
      "/api/stats - Get overall statistics"
    ]
  });
});

// Search by wallet address
router.get('/api/wallet/:address', async ({ params, env }) => {
  try {
    const { address } = params;
    
    const holder = await env.DB.prepare(
      'SELECT * FROM holders WHERE address = ?'
    ).bind(address).first();
    
    if (!holder) {
      return createResponse({
        success: false,
        error: "Wallet not found"
      }, 404);
    }
    
    return createResponse({
      success: true,
      data: holder
    });
  } catch (error) {
    return handleError(error);
  }
});

// Get paginated list of holders
router.get('/api/holders', async ({ query, env }) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 50, 1000); // Cap at 1000
    const offset = (page - 1) * limit;
    
    const holders = await env.DB.prepare(
      'SELECT * FROM holders ORDER BY rank ASC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();
    
    const count = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM holders'
    ).first();
    
    return createResponse({
      success: true,
      data: holders.results,
      pagination: {
        page,
        limit,
        total: count.count,
        pages: Math.ceil(count.count / limit)
      }
    });
  } catch (error) {
    return handleError(error);
  }
});

// Get holders in a specific rank range
router.get('/api/range/:from/:to', async ({ params, env }) => {
  try {
    const fromRank = parseInt(params.from);
    const toRank = parseInt(params.to);
    
    if (isNaN(fromRank) || isNaN(toRank) || fromRank < 1 || toRank < fromRank) {
      return createResponse({
        success: false,
        error: "Invalid rank range. 'from' and 'to' must be positive integers with from <= to"
      }, 400);
    }
    
    // Limit range size to prevent huge queries
    if (toRank - fromRank > 10000) {
      return createResponse({
        success: false,
        error: "Rank range too large. Maximum range size is 10,000 positions"
      }, 400);
    }
    
    const holders = await env.DB.prepare(
      'SELECT * FROM holders WHERE rank >= ? AND rank <= ? ORDER BY rank ASC'
    ).bind(fromRank, toRank).all();
    
    return createResponse({
      success: true,
      data: holders.results,
      range: {
        from: fromRank,
        to: toRank,
        count: holders.results.length
      }
    });
  } catch (error) {
    return handleError(error);
  }
});

// Get top N holders
router.get('/api/top/:count', async ({ params, env }) => {
  try {
    const count = Math.min(parseInt(params.count) || 50, 1000); // Cap at 1000
    
    if (isNaN(count) || count < 1) {
      return createResponse({
        success: false,
        error: "Invalid count. Must be a positive integer"
      }, 400);
    }
    
    const holders = await env.DB.prepare(
      'SELECT * FROM holders WHERE rank <= ? ORDER BY rank ASC'
    ).bind(count).all();
    
    return createResponse({
      success: true,
      data: holders.results,
      count: holders.results.length
    });
  } catch (error) {
    return handleError(error);
  }
});

// Get overall statistics
router.get('/api/stats', async ({ env }) => {
  try {
    const totalHolders = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM holders'
    ).first();
    
    const totalBalances = await env.DB.prepare(
      'SELECT SUM(mito_balance) as mito, SUM(wmito_balance) as wmito, SUM(total_balance) as total FROM holders'
    ).first();
    
    const topHolders = await env.DB.prepare(
      'SELECT SUM(total_balance) as balance FROM holders WHERE rank <= 100'
    ).first();
    
    // Get top percentile data using multiple queries since D1 has limited SQL support
    const holderCount = await env.DB.prepare('SELECT COUNT(*) as count FROM holders').first();
    const top1pctRank = Math.ceil(holderCount.count * 0.01);
    const top10pctRank = Math.ceil(holderCount.count * 0.1);
    const top20pctRank = Math.ceil(holderCount.count * 0.2);
    
    const top1pct = await env.DB.prepare(
      'SELECT SUM(total_balance) as sum FROM holders WHERE rank <= ?'
    ).bind(top1pctRank).first();
    
    const top10pct = await env.DB.prepare(
      'SELECT SUM(total_balance) as sum FROM holders WHERE rank <= ?'
    ).bind(top10pctRank).first();
    
    const top20pct = await env.DB.prepare(
      'SELECT SUM(total_balance) as sum FROM holders WHERE rank <= ?'
    ).bind(top20pctRank).first();
    
    return createResponse({
      success: true,
      data: {
        totalHolders: totalHolders.count,
        balances: {
          mito: totalBalances.mito,
          wmito: totalBalances.wmito,
          total: totalBalances.total
        },
        distribution: {
          top100Holders: {
            balance: topHolders.balance,
            percentage: (topHolders.balance / totalBalances.total) * 100
          },
          top1percent: {
            balance: top1pct.sum,
            percentage: (top1pct.sum / totalBalances.total) * 100
          },
          top10percent: {
            balance: top10pct.sum,
            percentage: (top10pct.sum / totalBalances.total) * 100
          },
          top20percent: {
            balance: top20pct.sum,
            percentage: (top20pct.sum / totalBalances.total) * 100
          }
        }
      }
    });
  } catch (error) {
    return handleError(error);
  }
});

// Handle CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
});

// Catch-all route for 404s
router.all('*', () => {
  return createResponse({
    success: false,
    error: "Endpoint not found"
  }, 404);
});

// Worker entry point
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  }
};
`;

  fs.writeFileSync('src/index.js', apiCode);
  console.log('Created API implementation at src/index.js');
  
  // Create package.json
  const packageJSON = {
    "name": "mito-api",
    "version": "1.0.0",
    "description": "API for MITO token holders data",
    "main": "src/index.js",
    "scripts": {
      "dev": "wrangler dev",
      "deploy": "wrangler deploy"
    },
    "dependencies": {
      "itty-router": "^4.0.22"
    },
    "devDependencies": {
      "wrangler": "^3.0.0"
    }
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJSON, null, 2));
  console.log('Created package.json');
  
  // Create README - fixed the template literal
  const readme = `# MITO Holders API

API for accessing the reranked MITO token holders data.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start local development server:
\`\`\`bash
npm run dev
\`\`\`

3. Deploy to Cloudflare:
\`\`\`bash
npm run deploy
\`\`\`

## API Endpoints

### Get Wallet Info
\`\`\`
GET /api/wallet/:address
\`\`\`

Returns data for a specific wallet address.

### Get Paginated Holders List
\`\`\`
GET /api/holders?page=1&limit=50
\`\`\`

Returns a paginated list of holders.

### Get Holders in Rank Range
\`\`\`
GET /api/range/:from/:to
\`\`\`

Example: GET /api/range/50/100 returns holders ranked 50-100.

### Get Top N Holders
\`\`\`
GET /api/top/:count
\`\`\`

Example: GET /api/top/50 returns the top 50 holders.

### Get Overall Statistics
\`\`\`
GET /api/stats
\`\`\`

Returns overall statistics about the token distribution.
`;

  fs.writeFileSync('README.md', readme);
  console.log('Created README.md');
}

main().catch(err => {
  console.error('Import failed:', err);
}); 