import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ExportButton } from "@/components/export-button";
import { Button } from "@/components/ui/button";
import { categoryBreakdown, complaints, teams } from "@/lib/complaints";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Complaint categories | SupportSense" },
      { name: "description", content: "See complaint volume and negative sentiment by category, and which team owns each one." },
      { property: "og:title", content: "Complaint categories | SupportSense" },
      { property: "og:description", content: "Category-level complaint volume, sentiment split and team ownership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const total = categoryBreakdown.reduce((sum, row) => sum + row.volume, 0);

  return (
    <AppShell title="Categories" subtitle="Where complaints come from and who owns them" actions={<ExportButton label="Export data" />}>
      <section className="grid gap-3 lg:grid-cols-2">
        {categoryBreakdown.map((row) => {
          const team = teams.find((item) => item.id === row.team) ?? teams[0]!;
          const share = Math.round((row.volume / total) * 100);
          const negativeShare = Math.round((row.negative / row.volume) * 100);
          const example = complaints.find((item) => item.category === row.category);

          return (
            <article key={row.category} className="rounded-2xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-bold">{row.category}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.volume} complaints · {share}% of volume</p>
                </div>
                <span className="rounded-full bg-negative/10 px-3 py-1 text-[11px] font-semibold text-negative">{negativeShare}% negative</span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${share}%` }} />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">Routed to <strong className="text-foreground">{team.name}</strong> · {team.owner} · {team.slaHours}h response target</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/complaints" search={{ id: example?.id }}>Open complaints<ArrowUpRight className="size-3.5" /></Link>
                </Button>
                <Button asChild variant="glass" size="sm"><Link to="/settings">Edit routing</Link></Button>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
