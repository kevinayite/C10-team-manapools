import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileDown,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  MessageSquareText,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Tags,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SupportSense | Complaint Intelligence" },
      { name: "description", content: "AI-powered complaint classification, customer sentiment analysis, and actionable service insights for financial institutions." },
      { property: "og:title", content: "SupportSense | Complaint Intelligence" },
      { property: "og:description", content: "Classify complaints, understand sentiment, and take action from one intelligent operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupportSense,
});

type Sentiment = "Negative" | "Neutral" | "Positive";
type Complaint = {
  id: string;
  customer: string;
  initials: string;
  title: string;
  body: string;
  category: string;
  issue: string;
  sentiment: Sentiment;
  confidence: number;
  priority: "High" | "Medium" | "Low";
  time: string;
};

const complaints: Complaint[] = [
  { id: "C-20418", customer: "Ava Richards", initials: "AR", title: "Charged twice for the same wire transfer", body: "I was charged twice for a single international wire transfer. One payment was completed, but the duplicate is still pending after five days. I need this reversed immediately because it has put my account below its minimum balance.", category: "Money transfer", issue: "Duplicate transaction", sentiment: "Negative", confidence: 96, priority: "High", time: "8m" },
  { id: "C-20417", customer: "Marcus Lee", initials: "ML", title: "Card declined while travelling overseas", body: "My card keeps getting declined overseas even though the app shows enough available balance. I informed the bank about my travel before leaving and cannot reach anyone by phone.", category: "Credit card", issue: "Card declined", sentiment: "Negative", confidence: 91, priority: "High", time: "21m" },
  { id: "C-20416", customer: "Priya Shah", initials: "PS", title: "Disputed charge resolved within a day", body: "Thank you for resolving the disputed card charge so quickly. The support specialist kept me informed and the refund is already visible in my account.", category: "Credit card", issue: "Dispute resolved", sentiment: "Positive", confidence: 94, priority: "Low", time: "43m" },
  { id: "C-20415", customer: "Tom Becker", initials: "TB", title: "Cannot find the latest foreign exchange rate", body: "Where can I find today's foreign exchange rate in the app? The rate shown on my statement seems different from the one I saw before confirming.", category: "Money transfer", issue: "Exchange rate", sentiment: "Neutral", confidence: 87, priority: "Medium", time: "1h" },
  { id: "C-20414", customer: "Nandi Dlamini", initials: "ND", title: "Mortgage payment marked as late", body: "My mortgage debit went through on the due date, but it has been marked late and a fee was added. Please correct the record before it affects my credit profile.", category: "Mortgage", issue: "Incorrect late fee", sentiment: "Negative", confidence: 93, priority: "High", time: "2h" },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Complaints", icon: Inbox, count: "342" },
  { label: "Categories", icon: Tags },
  { label: "Insights", icon: Lightbulb, count: "6" },
];

function SentimentPill({ sentiment }: { sentiment: Sentiment }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", sentiment === "Negative" && "bg-negative/10 text-negative", sentiment === "Positive" && "bg-positive/10 text-positive", sentiment === "Neutral" && "bg-neutral-sentiment/10 text-neutral-sentiment")}>{sentiment}</span>;
}

function SupportSense() {
  const [selectedId, setSelectedId] = useState(complaints[0].id);
  const [filter, setFilter] = useState<"All" | Sentiment>("All");
  const [query, setQuery] = useState("");
  const [insightApplied, setInsightApplied] = useState(false);
  const selected = complaints.find((item) => item.id === selectedId) ?? complaints[0];
  const visible = useMemo(() => complaints.filter((item) => (filter === "All" || item.sentiment === filter) && `${item.customer} ${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground lg:flex">
      <aside className="border-b border-glass-border bg-glass-strong backdrop-blur-2xl lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-17 items-center justify-between px-5 lg:border-b lg:border-glass-border">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25">SS</div>
            <div><div className="font-display text-[15px] font-bold">SupportSense</div><div className="text-[11px] text-muted-foreground">Complaint intelligence</div></div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="size-4" /></Button>
        </div>
        <nav className="hidden p-4 lg:block">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase text-muted-foreground">Workspace</p>
          {navItems.map(({ label, icon: Icon, count }) => <button key={label} className={cn("mb-1 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition", label === "Overview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-glass hover:text-foreground")}><Icon className="size-4" /><span>{label}</span>{count && <span className="ml-auto text-xs">{count}</span>}</button>)}
        </nav>
        <div className="hidden px-4 lg:absolute lg:inset-x-0 lg:bottom-5 lg:block">
          <div className="rounded-2xl border border-glass-border bg-glass p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold">Model connection</span><span className="flex items-center gap-1 text-[10px] font-medium text-positive"><span className="size-1.5 rounded-full bg-positive" />Ready</span></div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">FastAPI endpoint ready to connect</p>
            <Button variant="glass" size="sm" className="mt-3 w-full"><Settings className="size-3.5" />Configure</Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <header className="flex min-h-17 flex-wrap items-center gap-3 border-b border-glass-border bg-glass px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mr-auto"><h1 className="font-display text-lg font-bold">Intelligence overview</h1><p className="text-xs text-muted-foreground">Friday, 11 September · Live complaint operations</p></div>
          <label className="flex h-10 min-w-56 items-center gap-2 rounded-xl border border-glass-border bg-glass-strong px-3 shadow-sm"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search complaints" /></label>
          <Button variant="glass"><FileDown className="size-4" />Export</Button>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Open complaints", "342", "+12.4%", TrendingUp, "negative"],
              ["Avg. response time", "2.4h", "31% faster", TrendingDown, "positive"],
              ["Negative sentiment", "24%", "+2.1 pts", TrendingUp, "negative"],
              ["Auto-classified", "98.7%", "1,284 today", Zap, "primary"],
            ].map(([label, value, note, Icon, tone]) => <div key={String(label)} className="rounded-2xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">{label as string}</p><Icon className={cn("size-4", tone === "negative" && "text-negative", tone === "positive" && "text-positive", tone === "primary" && "text-primary")} /></div><p className="mt-3 font-display text-3xl font-bold">{value as string}</p><p className={cn("mt-1 text-[11px] font-medium", tone === "negative" && "text-negative", tone === "positive" && "text-positive", tone === "primary" && "text-primary")}>{note as string}</p></div>)}
          </section>

          <section className="grid min-h-[560px] overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-glass backdrop-blur-xl xl:grid-cols-[minmax(440px,1.15fr)_minmax(360px,.85fr)]">
            <div className="border-b border-glass-border xl:border-b-0 xl:border-r">
              <div className="flex flex-wrap items-center gap-2 border-b border-glass-border px-4 py-3">
                <div className="mr-auto"><h2 className="text-sm font-semibold">Live complaint feed</h2><p className="text-[11px] text-muted-foreground">AI-classified as complaints arrive</p></div>
                <Button variant="ghost" size="icon" aria-label="Filter options"><SlidersHorizontal className="size-4" /></Button>
              </div>
              <div className="flex gap-1 overflow-x-auto border-b border-glass-border px-4 py-2">
                {(["All", "Negative", "Neutral", "Positive"] as const).map((item) => <Button key={item} onClick={() => setFilter(item)} variant={filter === item ? "subtle" : "ghost"} size="sm">{item}</Button>)}
              </div>
              <div className="max-h-[480px] overflow-y-auto p-2">
                {visible.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-3 text-left transition", selected.id === item.id ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-glass-strong")}>
                  <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{item.initials}</span>
                  <span className="min-w-0"><span className="flex items-center gap-2"><strong className="truncate text-sm">{item.customer}</strong><span className="text-[10px] text-muted-foreground">{item.time}</span></span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.title}</span><span className="mt-2 flex items-center gap-2"><span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{item.category}</span><SentimentPill sentiment={item.sentiment} /></span></span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>)}
                {visible.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">No matching complaints</div>}
              </div>
            </div>

            <div className="bg-glass-strong/60">
              <div className="flex items-center justify-between border-b border-glass-border px-5 py-4"><div><span className="text-[11px] font-medium text-muted-foreground">{selected.id}</span><h2 className="mt-0.5 font-display text-lg font-bold">{selected.customer}</h2></div><span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", selected.priority === "High" ? "bg-negative/10 text-negative" : selected.priority === "Medium" ? "bg-warning/10 text-warning" : "bg-positive/10 text-positive")}>{selected.priority} priority</span></div>
              <div className="space-y-5 p-5">
                <div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Customer complaint</p><p className="mt-2 text-sm leading-6">“{selected.body}”</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-glass-border bg-glass p-3"><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground"><Tags className="size-3" />Classification</p><p className="mt-2 text-sm font-semibold">{selected.category}</p><p className="mt-0.5 text-xs text-muted-foreground">{selected.issue}</p></div>
                  <div className="rounded-xl border border-glass-border bg-glass p-3"><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground"><MessageSquareText className="size-3" />Sentiment</p><div className="mt-2 flex items-center justify-between"><SentimentPill sentiment={selected.sentiment} /><strong className="text-xs">{selected.confidence}%</strong></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={cn("h-full rounded-full", selected.sentiment === "Negative" ? "bg-negative" : selected.sentiment === "Positive" ? "bg-positive" : "bg-neutral-sentiment")} style={{ width: `${selected.confidence}%` }} /></div></div>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/8 p-4"><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><p className="text-xs font-bold text-primary">Recommended next action</p></div><p className="mt-2 text-sm leading-6">{selected.priority === "High" ? "Escalate to the specialist resolution team and acknowledge the customer within 30 minutes." : selected.sentiment === "Positive" ? "Close the case and tag this interaction as a positive service outcome." : "Send the relevant help article and request the transaction reference for review."}</p><div className="mt-3 flex gap-2"><Button size="sm">Apply action</Button><Button variant="glass" size="sm">Draft response</Button></div></div>
                <div className="flex items-center justify-between border-t border-glass-border pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />Classified in 184ms</span><Button variant="ghost" size="sm"><CircleHelp className="size-3.5" />Review result</Button></div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-primary/20 bg-insight-gradient p-5 shadow-glass">
            <div className="flex flex-col gap-4 md:flex-row md:items-center"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Sparkles className="size-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold">Emerging pattern: duplicate transfer complaints are up 38%</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">SupportSense detected 27 related complaints since Monday. Most involve international transfers created between 14:00 and 17:00.</p></div><Button onClick={() => setInsightApplied(true)} disabled={insightApplied}>{insightApplied ? "Routing rule applied" : "Create routing rule"}</Button></div>
          </section>
        </div>
      </main>
    </div>
  );
}