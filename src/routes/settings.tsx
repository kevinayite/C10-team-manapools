import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { teams } from "@/lib/complaints";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Model & routing settings | SupportSense" },
      { name: "description", content: "Configure the FastAPI classification endpoint and the teams complaints are routed to." },
      { property: "og:title", content: "Model & routing settings | SupportSense" },
      { property: "og:description", content: "Point SupportSense at your FastAPI model and manage routing owners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [endpoint, setEndpoint] = useState("http://localhost:8000/predict");
  const [threshold, setThreshold] = useState("85");

  return (
    <AppShell title="Settings" subtitle="Model connection and complaint routing">
      <section className="rounded-2xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl">
        <h2 className="font-display text-base font-bold">Model connection</h2>
        <p className="mt-1 text-xs text-muted-foreground">SupportSense sends each complaint to this endpoint for classification and sentiment.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="endpoint">FastAPI endpoint</Label>
            <Input id="endpoint" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="threshold">Auto-accept confidence (%)</Label>
            <Input id="threshold" inputMode="numeric" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => toast.success("Settings saved", { description: `Classifying with ${endpoint} above ${threshold}% confidence.` })}>Save settings</Button>
          <Button variant="glass" onClick={() => toast("Testing connection", { description: `Sent a sample complaint to ${endpoint}.` })}>Test connection</Button>
        </div>
      </section>

      <section className="rounded-2xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl">
        <h2 className="font-display text-base font-bold">Routing owners</h2>
        <p className="mt-1 text-xs text-muted-foreground">Complaints are handed to these teams based on category, sentiment and priority.</p>
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {teams.map((team) => (
            <li key={team.id} className="rounded-xl border border-glass-border bg-glass-strong p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{team.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{team.focus}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{team.slaHours}h SLA</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Owner: {team.owner}</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => toast(`${team.name} notified`, { description: `${team.owner} received the routing summary.` })}>Notify owner</Button>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
