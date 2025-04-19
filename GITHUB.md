# GitHub Repository Setup Guide

This guide explains how to set up this project on GitHub and configure it for Cloudflare deployment.

## Files to Include in GitHub Repository

The following files should be included in your GitHub repository:

**Essential files:**
- `src/index.js` - The main API code
- `package.json` - Project dependencies
- `wrangler.toml` - Cloudflare configuration (without database ID)
- `mito-holders-backup.sql` - Database backup (important for deployment)
- `README.md` - Project documentation
- `DEPLOY.md` - Deployment guide
- `LICENSE` - MIT license
- `.github/workflows/cloudflare.yml` - GitHub Actions workflow
- `.gitignore` - Git ignore rules

## Setting Up GitHub Repository

1. Create a new repository on GitHub
2. Initialize the repository locally:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/repository-name.git
   git push -u origin main
   ```

## Deployment Steps

After pushing to GitHub, follow the instructions in [DEPLOY.md](DEPLOY.md) to set up the Cloudflare deployment.

## Important Notes

- The `mito-holders-backup.sql` file is crucial for deployment - it contains your database schema and data
- When setting up in Cloudflare, you'll need to create a new D1 database and import this SQL file
- Configure the D1 database binding in the Cloudflare dashboard to connect your Worker to the database
- Make sure the binding is named `DB` exactly as it appears in the code 