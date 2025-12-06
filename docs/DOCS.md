# Peak Blooms Blog - Documentation Index

Welcome! This project transforms your 2-week Peak Blooms development journey into an impressive portfolio blog. Here's where to find everything:

## 📚 Documentation Guide

### Start Here
- **[README.md](./README.md)** - Project overview and vision
- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes

### Setup & Deployment
- **[SETUP.md](./SETUP.md)** - Comprehensive setup guide with troubleshooting
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Pre-deployment checklist
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Technical architecture details

### Configuration Files
- **[.env.local.example](./.env.local.example)** - Environment template
- **[package.json](./package.json)** - Dependencies and scripts
- **[tsconfig.json](./tsconfig.json)** - TypeScript configuration
- **[next.config.ts](./next.config.ts)** - Next.js configuration

## 🚀 Quick Navigation

### I want to...

**Get started immediately**
→ Follow [QUICKSTART.md](./QUICKSTART.md)

**Understand the full architecture**
→ Read [IMPLEMENTATION.md](./IMPLEMENTATION.md)

**Deploy to production**
→ Use [DEPLOYMENT.md](./DEPLOYMENT.md) checklist

**Troubleshoot issues**
→ Check "Troubleshooting" section in [SETUP.md](./SETUP.md)

**Understand the code**
→ Explore `/lib`, `/components`, and `/scripts` directories

**Update blog data**
→ Run `npm run process-blog` (see [SETUP.md](./SETUP.md))

## 📂 Project Structure

```
peak-blooms-blog/
├── 📄 Documentation
│   ├── README.md                # Project overview
│   ├── QUICKSTART.md           # 5-minute setup
│   ├── SETUP.md                # Detailed configuration
│   ├── DEPLOYMENT.md           # Deployment checklist
│   └── IMPLEMENTATION.md       # Technical details
│
├── 🎨 Frontend
│   ├── app/
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout + metadata
│   │   └── globals.css         # Tailwind config
│   └── components/
│       ├── BlogTimeline.tsx    # Main timeline
│       ├── DayPost.tsx         # Daily post view
│       ├── CommitCard.tsx      # Individual commit
│       ├── CommitDiff.tsx      # Diff display
│       └── ArchitecturalCallout.tsx  # Insight highlights
│
├── 🔧 Backend & Processing
│   ├── lib/
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── ai.ts               # LLM integration
│   │   └── syntax-highlight.ts # Code highlighting
│   └── scripts/
│       ├── extract-commits.ts  # Git extraction
│       └── process-blog-data.ts # Blog generation
│
├── 📦 Config & Dependencies
│   ├── package.json            # Dependencies + scripts
│   ├── tsconfig.json           # TypeScript config
│   ├── next.config.ts          # Next.js config
│   ├── postcss.config.mjs      # Tailwind config
│   ├── eslint.config.mjs       # ESLint rules
│   └── .env.local.example      # Environment template
│
└── 📊 Generated Content
    └── public/
        └── blog-data.json      # Generated blog (pre-processed)
```

## 🛠 Key Scripts

```bash
npm install           # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run process-blog # Generate blog data (LOCAL ONLY with LM Studio)
```

## 🎯 Core Concepts

### Build-Time Processing
Blog data is generated locally once, then deployed as static JSON. This means:
- ✅ No runtime dependencies on Vercel
- ✅ Maximum performance for users
- ✅ Local AI processing (privacy)
- ✅ Repeatable, auditable builds

### Data Flow
```
Peak Blooms Repo
    ↓ (git clone)
Commit Extraction
    ↓ (simple-git)
Date Grouping
    ↓ (group by calendar day)
AI Analysis
    ↓ (Gemma3 via LM Studio)
Blog JSON
    ↓ (stored in git)
Next.js Build
    ↓ (static generation)
Vercel Deployment
    ↓ (CDN distribution)
User Visits Blog
```

### Component Hierarchy
```
RootLayout (metadata, styling)
  └── Home (page)
      └── BlogTimeline (container)
          └── DayPost (per day)
              ├── ArchitecturalCallouts
              ├── Learnings
              ├── KeyDecisions
              └── CommitCard[] (expandable)
                  └── CommitDiff
```

## 💡 Design Philosophy

This site demonstrates:
- **User-Centric Design**: Every detail matters
- **Accessibility**: WCAG compliant, dark mode, responsive
- **Performance**: Static generation, optimized bundle
- **Thoughtfulness**: Architecture decisions visible in the product
- **Quality**: Clean code, proper typing, error handling

## 🔐 Security & Privacy

- **No Secret Leaks**: `.env.local` is in `.gitignore`
- **Local Processing**: AI analysis happens on your machine
- **Secure Auth**: GitHub token scoped to needed permissions
- **Safe Deployment**: Static content, no backend required

## 📖 Learning Resources

Inside the code, you'll find:
- Clean TypeScript patterns
- React best practices (19+)
- Next.js App Router usage
- Tailwind CSS organization
- Component composition
- Error handling patterns
- Type safety throughout

## 🚢 Deployment Platforms Supported

- **Vercel** ✅ (recommended, zero-config)
- **Netlify** ✅ (same static approach)
- **GitHub Pages** ✅ (via `out` directory)
- **Self-Hosted** ✅ (Node.js server with `npm start`)

## 📞 Getting Help

1. **Check the docs**: Most answers are in SETUP.md
2. **Review examples**: See component implementations
3. **Check TypeScript**: IDE hints guide proper usage
4. **Search code**: Look for similar patterns

## 🎓 Next Steps

1. **Choose Your Path**:
   - [QUICKSTART.md](./QUICKSTART.md) → Fast setup
   - [SETUP.md](./SETUP.md) → Deep dive
   - [IMPLEMENTATION.md](./IMPLEMENTATION.md) → Architecture understanding

2. **Set Up Locally**:
   - Install dependencies
   - Configure environment
   - Run blog generation

3. **Deploy**:
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Push to Vercel
   - Share with the world

## 🌟 What Makes This Special

This isn't just a blog—it's a **portfolio**. It demonstrates:
- System thinking and architecture
- Attention to user experience details
- Modern web technology choices
- Thoughtful documentation
- Ability to complete complex projects
- Understanding of performance and optimization

Perfect for impressing potential employers and showcasing your full skill set.

---

**Ready?** Start with [QUICKSTART.md](./QUICKSTART.md) for your first 5 minutes! 🚀

Questions? Check [SETUP.md](./SETUP.md#troubleshooting) for answers.

Need architecture details? Read [IMPLEMENTATION.md](./IMPLEMENTATION.md).
