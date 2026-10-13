// Maps raw dependency names to the technology they represent, grouped by
// the layer of the stack they belong to.
export const CATEGORIES = ["Frontend", "Backend", "Data", "AI", "Integrations", "Testing & Tooling"];

const RULES = [
  ["Frontend", "React", /^react$/],
  ["Frontend", "Next.js", /^next$/],
  ["Frontend", "Vite", /^vite$/],
  ["Frontend", "Tailwind CSS", /^tailwindcss$/],
  ["Frontend", "shadcn/Radix", /^@radix-ui\//],
  ["Frontend", "TanStack Query", /^@tanstack\/react-query$/],
  ["Frontend", "React Router", /^react-router(-dom)?$/],
  ["Frontend", "Framer Motion", /^(framer-motion|motion)$/],
  ["Frontend", "Recharts", /^recharts$/],
  ["Frontend", "React Hook Form", /^react-hook-form$/],
  ["Frontend", "Electron", /^electron$/],
  ["Backend", "Node.js HTTP", /^(express|fastify|hono|koa)$/],
  ["Backend", "Zod", /^zod$/],
  ["Backend", "FastAPI", /^fastapi$/],
  ["Backend", "Flask", /^flask$/],
  ["Backend", "WebSockets", /^(ws|socket\.io|socket\.io-client)$/],
  ["Backend", "FFmpeg", /ffmpeg/],
  ["Data", "Supabase", /^@supabase\//],
  ["Data", "PostgreSQL", /^(pg|postgres|psycopg2?(-binary)?|asyncpg)$/],
  ["Data", "SQLite", /^(better-sqlite3|sqlite3|sqlite)$/],
  ["Data", "MySQL", /^(mysql2?|pymysql|mysqlclient)$/],
  ["Data", "Redis", /^(redis|ioredis)$/],
  ["Data", "Drizzle/Prisma", /^(drizzle-orm|prisma|@prisma\/client)$/],
  ["AI", "Claude API", /^(@anthropic-ai\/sdk|anthropic|@anthropic-ai\/claude-agent-sdk|claude-agent-sdk)$/],
  ["AI", "OpenAI API", /^openai$/],
  ["AI", "Gemini API", /^(@google\/genai|@google\/generative-ai|google-genai|google-generativeai)$/],
  ["AI", "Vercel AI SDK", /^ai$/],
  ["AI", "MCP", /^(@modelcontextprotocol\/sdk|mcp)$/],
  ["Integrations", "Meta Graph API", /(facebook|meta).*(business|sdk|graph)/],
  ["Integrations", "Stripe/Payments", /^(stripe|@stripe\/.*|paystack.*)$/],
  ["Integrations", "Email (SendGrid/Resend)", /^(@sendgrid\/mail|resend|nodemailer)$/],
  ["Integrations", "Google APIs", /^(googleapis|google-api-python-client|gspread)$/],
  ["Integrations", "Twilio/WhatsApp", /^(twilio|whatsapp-web\.js|@whiskeysockets\/baileys)$/],
  ["Testing & Tooling", "TypeScript", /^typescript$/],
  ["Testing & Tooling", "Playwright", /^(playwright|@playwright\/test)$/],
  ["Testing & Tooling", "Vitest/Jest", /^(vitest|jest)$/],
  ["Testing & Tooling", "ESLint", /^eslint$/],
  ["Testing & Tooling", "pytest", /^pytest$/],
];

export function classify(dep) {
  for (const [category, label, re] of RULES) if (re.test(dep)) return { category, label };
  return null;
}
