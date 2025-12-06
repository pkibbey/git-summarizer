## Peak Blooms Blog

A portfolio website showcasing the development of a fully-featured website built in 2 weeks. This site automatically transforms git commits from the Peak Blooms project into a narrative-driven development journal, powered by AI analysis and thoughtful design.

### Vision

This is an **alternative resume** that demonstrates:
- **Architectural Thinking**: How thoughtful decisions compound into a complete product
- **User-Centric Design**: Decades of experience reflected in every detail
- **Software Quality**: Conscious choices about scalability, maintainability, and performance
- **Problem-Solving**: Real challenges faced and elegant solutions implemented
- **Full-Stack Capability**: From concept through deployment

### Key Features

✨ **AI-Powered Summaries** - Gemma3 generates daily summaries and extracts insights
📊 **Commit Analytics** - File changes, statistics, and code diffs for each commit
🎯 **Architectural Callouts** - Highlights design decisions and key learnings
📅 **Chronological Timeline** - See the project evolution day by day
🌙 **Dark Mode Support** - Comfortable reading experience
⚡ **Fast & Static** - Built at deploy time, served instantly

### Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vercel AI SDK** - LLM integration
- **Gemma3 (Local LLM)** - AI analysis without cloud dependency
- **Shiki** - Syntax highlighting for code
- **Vercel** - Deployment platform

### Getting Started

**For Setup & Development**: See [SETUP.md](./SETUP.md)

Quick start:
```bash
npm install
npm run process-blog    # Generate blog data (requires LM Studio + GitHub token)
npm run dev             # Start dev server
npm run build           # Build for production
```

### Project Structure

```
peak-blooms-blog/
├── app/                  # Next.js App Router pages
├── components/           # React components
├── lib/                  # Utilities and types
├── scripts/              # Blog generation scripts
├── public/               # Static files and blog-data.json
└── SETUP.md             # Detailed setup guide
```

### Development Workflow

1. Peak Blooms project gets commits
2. Run `npm run process-blog` locally
3. AI analyzes commits and generates insights
4. Push results to GitHub
5. Vercel deploys automatically

### Who Is This For?

**Hiring Managers & Recruiters**: Explore the full development journey and witness thoughtful engineering at every level.

**Other Engineers**: Learn how to balance speed with quality, and how to document your work in a meaningful way.

**Future Self**: Reflect on decisions made during rapid development and appreciate the learning journey.

### Design Philosophy

Every detail matters. This site demonstrates that care and attention extend beyond the code:
- Accessible color contrasts and typography
- Responsive layout that works everywhere
- Semantic HTML and performance-first decisions
- Clear information hierarchy
- Delightful micro-interactions

### About Peak Blooms

The original Peak Blooms project is a fully-featured website built in just over 2 weeks. It showcases rapid development, architectural decision-making, and the ability to deliver a complete product with thoughtful design.

See the source: [github.com/pkibbey/peak-blooms](https://github.com/pkibbey/peak-blooms)

### Deployment

Deployed on Vercel for reliability, speed, and simplicity: [peak-blooms-blog.vercel.app](https://peak-blooms-blog.vercel.app)

---

Built with ❤️ by [Phineas Kibbey](https://github.com/pkibbey)
