# Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- GitHub personal access token (create at https://github.com/settings/tokens)
- LM Studio running with Gemma3 model loaded

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your GitHub token

3. **Generate Blog Data** (must have LM Studio running)
   ```bash
   npm run process-blog
   ```
   This takes 5-10 minutes depending on commit count

4. **View Locally** (optional)
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

5. **Deploy to Vercel**
   ```bash
   git add public/blog-data.json
   git commit -m "chore: add blog data"
   git push
   ```

## What Happens at Each Step

### `npm install`
Downloads all dependencies including:
- Next.js 16
- React 19
- Vercel AI SDK
- simple-git for git parsing
- Tailwind CSS
- Shiki for syntax highlighting

### `npm run process-blog`
Automatically:
1. Clones your private Peak Blooms repo (using GitHub token)
2. Extracts all git commits with full metadata
3. Groups commits by calendar day
4. Sends each day's commits to Gemma3 AI (running locally)
5. Generates architectural insights and summaries
6. Creates `public/blog-data.json`
7. Cleans up temporary files

Output includes commit analysis, key decisions, learnings, and architectural callouts.

### `npm run dev`
Starts development server where you can:
- View the blog locally
- See loading states and error handling
- Test dark mode
- Test responsive design

### Deployment to Vercel
Once you push with the blog data:
- Vercel automatically builds your site
- Blog data is bundled as static JSON
- Site deploys to your Vercel project URL
- No runtime dependencies needed

## Troubleshooting

### "Cannot find module 'simple-git'"
```bash
npm install
```

### "LM Studio connection refused"
- Verify LM Studio is running
- Check Gemma3 model is loaded
- Verify `http://localhost:1234/v1` is accessible

### "GitHub token authentication failed"
- Create new token at https://github.com/settings/tokens
- Ensure 'repo' scope is selected
- Update `.env.local` with new token

### "No blog data generated"
- Check console output for detailed error messages
- Verify GITHUB_TOKEN is set correctly
- Ensure LM Studio is responding (try `curl http://localhost:1234/v1/models`)

## Next Steps

- Review generated `public/blog-data.json`
- Check the blog at http://localhost:3000
- Customize styling in `app/globals.css`
- Update metadata in `app/layout.tsx`
- Deploy to Vercel via GitHub push

See [SETUP.md](./SETUP.md) for detailed information.
