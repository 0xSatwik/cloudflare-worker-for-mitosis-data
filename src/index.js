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
router.get('/', (request, env, ctx) => {
  console.log("Root route handler received env:", JSON.stringify(env || {}));
  
  // Create HTML response for better documentation
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MITO Holders API</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    h1 {
      color: #2563eb;
      margin-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    .endpoint {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      border-left: 4px solid #3b82f6;
    }
    .url {
      background-color: #f1f5f9;
      padding: 10px 15px;
      border-radius: 4px;
      font-family: monospace;
      display: inline-block;
      margin: 10px 0;
      font-weight: bold;
    }
    .method {
      background-color: #2563eb;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      margin-right: 8px;
    }
    .description {
      margin-top: 10px;
      color: #4b5563;
    }
    .params {
      margin-top: 15px;
    }
    .param {
      margin-bottom: 5px;
    }
    .param-name {
      font-family: monospace;
      font-weight: bold;
      color: #4b5563;
    }
    .example {
      background-color: #f1f5f9;
      padding: 10px 15px;
      border-radius: 4px;
      font-family: monospace;
      margin-top: 15px;
      font-size: 14px;
      overflow-x: auto;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    @media (max-width: 768px) {
      body {
        padding: 15px;
      }
      .url, .example {
        overflow-x: auto;
        max-width: 100%;
        font-size: 13px;
      }
    }
  </style>
</head>
<body>
  <h1>MITO Holders API</h1>
  <p>This API provides access to reranked MITO token holders data with various query capabilities.</p>
  
  <div class="endpoint">
    <div><span class="method">GET</span> Wallet Information</div>
    <div class="url">/api/wallet/:address</div>
    <div class="description">Get detailed information about a specific wallet address, including its rank and balances.</div>
    <div class="params">
      <div class="param"><span class="param-name">:address</span> - Ethereum wallet address</div>
    </div>
    <div class="example">
      Example: /api/wallet/0x1234567890abcdef1234567890abcdef12345678
    </div>
  </div>
  
  <div class="endpoint">
    <div><span class="method">GET</span> Paginated Holders List</div>
    <div class="url">/api/holders?page=1&limit=50</div>
    <div class="description">Get a paginated list of all token holders sorted by rank.</div>
    <div class="params">
      <div class="param"><span class="param-name">page</span> - Page number (default: 1)</div>
      <div class="param"><span class="param-name">limit</span> - Results per page (default: 50, max: 1000)</div>
    </div>
    <div class="example">
      Example: /api/holders?page=2&limit=100
    </div>
  </div>
  
  <div class="endpoint">
    <div><span class="method">GET</span> Rank Range Query</div>
    <div class="url">/api/range/:from/:to</div>
    <div class="description">Get holders within a specific rank range (maximum range size: 10,000 positions).</div>
    <div class="params">
      <div class="param"><span class="param-name">:from</span> - Starting rank (inclusive)</div>
      <div class="param"><span class="param-name">:to</span> - Ending rank (inclusive)</div>
    </div>
    <div class="example">
      Example: /api/range/50/100 (returns holders ranked 50-100)
    </div>
  </div>
  
  <div class="endpoint">
    <div><span class="method">GET</span> Top N Holders</div>
    <div class="url">/api/top/:count</div>
    <div class="description">Get the top N holders by rank.</div>
    <div class="params">
      <div class="param"><span class="param-name">:count</span> - Number of top holders to return (max: 1000)</div>
    </div>
    <div class="example">
      Example: /api/top/50
    </div>
  </div>
  
  <div class="endpoint">
    <div><span class="method">GET</span> Overall Statistics</div>
    <div class="url">/api/stats</div>
    <div class="description">Get comprehensive statistics about token distribution including total holders, balances, and wealth distribution metrics.</div>
    <div class="example">
      Example: /api/stats
    </div>
  </div>
  
  <div class="footer">
    MITO Holders API v1.0.0 | &copy; ${new Date().getFullYear()} | Data excludes top 14 whale wallets
  </div>
</body>
</html>
  `;
  
  // Return HTML response
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...corsHeaders
    }
  });
});

// Search by wallet address
router.get('/api/wallet/:address', async (request, env, ctx) => {
  try {
    // Access params directly from the request object
    const { params } = request;
    console.log("Wallet route handler received env:", JSON.stringify(env || {}));
    
    if (!env || !env.DB) {
      console.error("env or env.DB is missing inside the wallet route handler!", JSON.stringify(env || {}));
      return createResponse({ 
        success: false, 
        error: "Internal configuration error" 
      }, 500);
    }
    
    const { address } = params;
    
    console.log(`Attempting DB query for address: ${address}`);
    
    const holder = await env.DB.prepare(
      'SELECT * FROM holders WHERE address = ?'
    ).bind(address).first();
    
    console.log("DB query result:", JSON.stringify(holder || null));
    
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
    console.error("Error in /api/wallet/:address handler:", error);
    return handleError(error); 
  }
});

// Get paginated list of holders
router.get('/api/holders', async (request, env, ctx) => {
  try {
    const { query } = request;
    console.log("Holders route handler received env:", JSON.stringify(env || {}));
    
    if (!env || !env.DB) {
      console.error("env or env.DB is missing inside the holders route handler!", JSON.stringify(env || {}));
      return createResponse({ 
        success: false, 
        error: "Internal configuration error" 
      }, 500);
    }
    
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
    console.error("Error in /api/holders handler:", error);
    return handleError(error);
  }
});

// Get holders in a specific rank range
router.get('/api/range/:from/:to', async (request, env, ctx) => {
  try {
    const { params } = request;
    console.log("Range route handler received env:", JSON.stringify(env || {}));
    
    if (!env || !env.DB) {
      console.error("env or env.DB is missing inside the range route handler!", JSON.stringify(env || {}));
      return createResponse({ 
        success: false, 
        error: "Internal configuration error" 
      }, 500);
    }
    
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
    console.error("Error in /api/range/:from/:to handler:", error);
    return handleError(error);
  }
});

// Get top N holders
router.get('/api/top/:count', async (request, env, ctx) => {
  try {
    const { params } = request;
    console.log("Top route handler received env:", JSON.stringify(env || {}));
    
    if (!env || !env.DB) {
      console.error("env or env.DB is missing inside the top route handler!", JSON.stringify(env || {}));
      return createResponse({ 
        success: false, 
        error: "Internal configuration error" 
      }, 500);
    }
    
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
    console.error("Error in /api/top/:count handler:", error);
    return handleError(error);
  }
});

// Get overall statistics
router.get('/api/stats', async (request, env, ctx) => {
  try {
    console.log("Stats route handler received env:", JSON.stringify(env || {}));
    
    if (!env || !env.DB) {
      console.error("env or env.DB is missing inside the stats route handler!", JSON.stringify(env || {}));
      return createResponse({ 
        success: false, 
        error: "Internal configuration error" 
      }, 500);
    }
    
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
    console.error("Error in /api/stats handler:", error);
    return handleError(error);
  }
});

// Handle CORS preflight requests
router.options('*', (request, env, ctx) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
});

// Catch-all route for 404s
router.all('*', (request, env, ctx) => {
  return createResponse({
    success: false,
    error: "Endpoint not found"
  }, 404);
});

// Worker entry point
export default {
  async fetch(request, env, ctx) {
    console.log("Worker received env keys:", Object.keys(env || {}));
    
    if (!env || !env.DB) {
      console.error("Critical error: env or env.DB missing at worker entry point!", JSON.stringify(env || {}));
      return new Response("Internal Server Error: Database connection failed", { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          ...corsHeaders
        }
      });
    }
    
    try {
      // Pass env explicitly to router.handle
      const result = await router.handle(request, env, ctx);
      return result;
    } catch (error) {
      console.error("Unhandled error in fetch handler:", error);
      return new Response("Internal Server Error", { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          ...corsHeaders
        }
      });
    }
  }
};
