# Deployment Checklist

Use this checklist to verify everything is ready before deploying.

## Pre-Deployment (Local Setup)

- [ ] Node.js 18+ installed
- [ ] GitHub personal access token created (repo scope)
- [ ] LM Studio installed and Gemma3 model available
- [ ] Cloned this repository locally

## Local Configuration

- [ ] `npm install` completed successfully
- [ ] `.env.local` created from `.env.local.example`
- [ ] `GITHUB_TOKEN` added to `.env.local`
- [ ] `LM_STUDIO_BASE_URL` verified in `.env.local` (default: `http://localhost:1234/v1`)

## Blog Generation

- [ ] Started LM Studio
- [ ] Loaded Gemma3 model in LM Studio
- [ ] Verified LM Studio is running: `curl http://localhost:1234/v1/models`
- [ ] Ran `npm run process-blog`
- [ ] Command completed successfully (check for ✅ message)
- [ ] `public/blog-data.json` created and contains data
- [ ] Reviewed generated blog data structure

## Local Testing (Optional)

- [ ] Ran `npm run dev`
- [ ] Opened `http://localhost:3000`
- [ ] Blog displays with expected content
- [ ] Dark mode toggle works
- [ ] Commit cards expand/collapse properly
- [ ] All links work (GitHub, repo links)
- [ ] Responsive design works on mobile

## Git Operations

- [ ] `git add public/blog-data.json`
- [ ] `git commit -m "chore: generate blog data"`
- [ ] `.env.local` is in `.gitignore` (do NOT commit)
- [ ] No sensitive data in commit

## Vercel Setup

- [ ] GitHub repository connected to Vercel
- [ ] Project created in Vercel dashboard
- [ ] Environment variables added to Vercel:
  - [ ] `GITHUB_TOKEN` (your personal access token)
  - [ ] `LM_STUDIO_BASE_URL` (optional)

## Vercel Configuration

- [ ] Framework: Next.js
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Node.js version: 18.x or higher

## Pre-Push Review

- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run build` - successful build
- [ ] All TypeScript types check: `tsc --noEmit`

## Deployment

- [ ] `git push` to main branch
- [ ] Monitor Vercel deployment (should auto-trigger)
- [ ] Build completes successfully
- [ ] Deployment link is live
- [ ] Site is accessible at your Vercel URL

## Post-Deployment Verification

- [ ] Blog loads on production
- [ ] Blog data displays correctly
- [ ] Dark mode works
- [ ] Responsive design works
- [ ] GitHub links point to correct repository
- [ ] All metadata/SEO looks correct
- [ ] Performance is fast (check Lighthouse)
- [ ] No console errors in browser DevTools

## Ongoing Maintenance

### When Peak Blooms Gets New Commits

1. [ ] Ensure Peak Blooms repo is up to date
2. [ ] Run `npm run process-blog` locally
3. [ ] Review generated `public/blog-data.json`
4. [ ] Commit changes: `git add public/blog-data.json && git commit -m "chore: update blog data"`
5. [ ] Push to GitHub: `git push`
6. [ ] Verify Vercel auto-deploys

### Regular Updates

- [ ] Check LM Studio is still accessible
- [ ] Verify GitHub token hasn't expired (90 days recommended)
- [ ] Monitor build times and adjust as needed
- [ ] Review analytics if added

## Troubleshooting

If deployment fails:

1. [ ] Check Vercel build logs for specific error
2. [ ] Verify `public/blog-data.json` exists and is valid JSON
3. [ ] Ensure all TypeScript types are correct
4. [ ] Check that dependencies are properly listed in `package.json`
5. [ ] Verify environment variables are set in Vercel

If blog data is empty:

1. [ ] Ensure GitHub token has `repo` scope
2. [ ] Verify LM Studio is running locally
3. [ ] Check that commits exist in Peak Blooms repository
4. [ ] Review console output from `npm run process-blog` for errors
5. [ ] Try running with `--verbose` flag if available

If site is slow:

1. [ ] Check Lighthouse performance score
2. [ ] Verify blog-data.json file size (should be <5MB)
3. [ ] Check browser DevTools Network tab
4. [ ] Verify CDN is caching properly

## Success Criteria

Your deployment is successful when:

✅ Site is live at your Vercel URL
✅ Blog data loads and displays
✅ All days and commits are visible
✅ UI is responsive and accessible
✅ Dark mode works
✅ GitHub links are functional
✅ No console errors
✅ Lighthouse score >90

## Next Steps After Deployment

1. Share the site URL with potential employers
2. Update your resume/portfolio to include link
3. Write a blog post about the development process
4. Consider adding custom domain
5. Set up analytics (optional)
6. Schedule blog data regeneration as Peak Blooms progresses

## Support Resources

- **Quick Setup**: See `QUICKSTART.md`
- **Detailed Guide**: See `SETUP.md`
- **Architecture**: See `IMPLEMENTATION.md`
- **Issues**: Check troubleshooting section in `SETUP.md`

---

Ready to launch? Follow this checklist step-by-step, and your Peak Blooms blog will be live! 🚀
