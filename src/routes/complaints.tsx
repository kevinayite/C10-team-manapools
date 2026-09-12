import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ComplaintConsole } from "@/components/complaint-console";
import { ExportButton } from "@/components/export-button";
import { fallbackComplaint } from "@/lib/complaints";

export const Route = createFileRoute("/complaints")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Complaint queue | SupportSense" },
      { name: "description", content: "Work the live complaint queue with AI classification, sentiment scores, routing and drafted replies." },
      { property: "og:title", content: "Complaint queue | SupportSense" },
      { property: "og:description", content: "Triage complaints, review classifications and send drafted replies from one queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: "/complaints" });

  return (
    <AppShell title="Complaint queue" subtitle="Every complaint, classified and routed to an owner" actions={<ExportButton label="Export queue" />}>
      <ComplaintConsole
        selectedId={id ?? fallbackComplaint.id}
        onSelect={(next) => navigate({ search: { id: next } })}
        heading="Complaint queue"
        subheading="Select a complaint to review, route or reply"
      />
    </AppShell>
  );
}
