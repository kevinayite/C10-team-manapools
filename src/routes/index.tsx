import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ComplaintConsole } from "@/components/complaint-console";
import { ComplaintIntake } from "@/components/complaint-intake";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { fallbackComplaint, insights, teams } from "@/lib/complaints";
import { getStoredComplaints, type StoredComplaint } from "@/lib/model-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CasePilot | Complaint Intelligence" },
      { name: "description", content: "AI-powered complaint classification, customer sentiment analysis, and actionable service insights for financial institutions." },
      { property: "og:title", content: "CasePilot | Complaint Intelligence" },
      { property: "og:description", content: "Classify complaints, understand sentiment, and take action from one intelligent operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});

const metricIcons = [TrendingUp, TrendingDown, TrendingUp, Zap];

function OverviewPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(fallbackComplaint.id);
  const [ruleApplied, setRuleApplied] = useState(false);
  const [storedComplaints, setStoredComplaints] = useState<StoredComplaint[]>([]);
  const topInsight = insights[0]!;
  const insightTeam = teams.find((team) => team.id === topInsight.team) ?? teams[0]!;
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const negativeCount = storedComplaints.filter((complaint) => complaint.sentiment === "Negative").length;
  const metrics = [
    { label: "Open complaints", value: String(storedComplaints.length), note: "Live API records", tone: "negative" as const },
    { label: "Avg. response time", value: storedComplaints.length > 0 ? "Pending" : "-", note: "No response data yet", tone: "positive" as const },
    { label: "Negative sentiment", value: storedComplaints.length > 0 ? `${Math.round((negativeCount / storedComplaints.length) * 100)}%` : "-", note: "From classified cases", tone: "negative" as const },
    { label: "Auto-classified", value: storedComplaints.length > 0 ? "100%" : "-", note: `${storedComplaints.length} today`, tone: "primary" as const },
  ];

  async function loadSummary() {
    try {
      setStoredComplaints(await getStoredComplaints());
    } catch {
      setStoredComplaints([]);
    }
  }

  useEffect(() => {
    void loadSummary();
    window.addEventListener("complaint-created", loadSummary);
    return () => window.removeEventListener("complaint-created", loadSummary);
  }, []);

  return (
    <AppShell
      title="Intelligence overview"
      subtitle={`${today} · Live complaint operations`}
      actions={<ExportButton />}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, tone }, index) => {
          const Icon = metricIcons[index] ?? Zap;
          return (
            <div key={label} className="rounded-2xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <Icon className={cn("size-4", tone === "negative" && "text-negative", tone === "positive" && "text-positive", tone === "primary" && "text-primary")} />
              </div>
              <p className="mt-3 font-display text-3xl font-bold">{value}</p>
              <p className={cn("mt-1 text-[11px] font-medium", tone === "negative" && "text-negative", tone === "positive" && "text-positive", tone === "primary" && "text-primary")}>{note}</p>
            </div>
          );
        })}
      </section>

      <ComplaintIntake />

      <ComplaintConsole
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id);
          navigate({ to: "/complaints", search: { id } });
        }}
      />

      <section className="rounded-2xl border border-primary/20 bg-insight-gradient p-5 shadow-glass">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Sparkles className="size-5" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Emerging pattern: {topInsight.title.toLowerCase()}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{topInsight.detail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setRuleApplied(true);
                toast.success("Routing rule created", { description: `Matching complaints now go to ${insightTeam.name} (${insightTeam.owner}).` });
              }}
              disabled={ruleApplied}
            >
              {ruleApplied ? "Routing rule applied" : "Create routing rule"}
            </Button>
            <Button asChild variant="glass"><Link to="/insights">See all insights</Link></Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
