import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { insights, teams } from "@/lib/complaints";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Actionable insights | CasePilot" },
      { name: "description", content: "Emerging complaint patterns with the team that should own them and one-click routing rules." },
      { property: "og:title", content: "Actionable insights | CasePilot" },
      { property: "og:description", content: "Emerging complaint patterns, volumes and one-click routing rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const [applied, setApplied] = useState<string[]>([]);

  return (
    <AppShell title="Insights" subtitle="Patterns CasePilot found across recent complaints" actions={<ExportButton label="Export insights" />}>
      <section className="grid gap-3 lg:grid-cols-2">
        {insights.map((insight) => {
          const team = teams.find((item) => item.id === insight.team) ?? teams[0]!;
          const isApplied = applied.includes(insight.id);

          return (
            <article key={insight.id} className="rounded-2xl border border-primary/20 bg-insight-gradient p-5 shadow-glass">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><Sparkles className="size-4" /></div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold">{insight.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-negative"><TrendingUp className="size-3.5" />{insight.trend}</span>
                <span>{insight.volume} complaints</span>
                <span>Owner: {team.owner}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={isApplied}
                  onClick={() => {
                    setApplied((value) => [...value, insight.id]);
                    toast.success("Routing rule created", { description: `Matching complaints now go to ${team.name} (${team.owner}).` });
                  }}
                >
                  {isApplied ? `Routed to ${team.name}` : "Create routing rule"}
                </Button>
                <Button asChild variant="glass" size="sm"><Link to="/complaints">Review complaints</Link></Button>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
