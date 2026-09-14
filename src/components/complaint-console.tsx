import {
  ChevronRight,
  CircleHelp,
  Clock3,
  MessageSquareText,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Tags,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  complaints,
  categoryForIssue,
  draftResponse,
  fallbackComplaint,
  recommendedAction,
  routeComplaint,
  type Complaint,
  type Sentiment,
} from "@/lib/complaints";
import { classifyComplaint, getStoredComplaints, type ModelClassification } from "@/lib/model-api";
import { cn } from "@/lib/utils";

export function SentimentPill({ sentiment }: { sentiment: Sentiment }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", sentiment === "Negative" && "bg-negative/10 text-negative", sentiment === "Positive" && "bg-positive/10 text-positive", sentiment === "Neutral" && "bg-neutral-sentiment/10 text-neutral-sentiment")}>{sentiment}</span>
  );
}

export function ComplaintConsole({
  selectedId,
  onSelect,
  heading = "Live complaint feed",
  subheading = "AI-classified as complaints arrive",
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  heading?: string;
  subheading?: string;
}) {
  const [filter, setFilter] = useState<"All" | Sentiment>("All");
  const [priorityOnly, setPriorityOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [modelResult, setModelResult] = useState<ModelClassification | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [storedComplaints, setStoredComplaints] = useState<Complaint[]>([]);

  async function loadStoredComplaints() {
    try {
      const rows = await getStoredComplaints();
      setStoredComplaints(rows.map((row) => ({
        id: row.id,
        customer: row.customer,
        initials: "NC",
        title: row.title,
        body: row.body,
        category: categoryForIssue(row.issue),
        issue: row.issue,
        sentiment: row.sentiment,
        confidence: Math.round(row.issue_confidence * 100),
        priority: row.priority,
        time: new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      })));
    } catch {
      setStoredComplaints([]);
    }
  }

  useEffect(() => {
    void loadStoredComplaints();
    window.addEventListener("complaint-created", loadStoredComplaints);
    return () => window.removeEventListener("complaint-created", loadStoredComplaints);
  }, []);

  const availableComplaints = storedComplaints.length > 0 ? storedComplaints : complaints;
  const selected: Complaint = availableComplaints.find((item) => item.id === selectedId) ?? availableComplaints[0] ?? fallbackComplaint;
  const team = routeComplaint(selected);

  const visible = useMemo(
    () =>
      availableComplaints.filter(
        (item) =>
          (filter === "All" || item.sentiment === filter) &&
          (!priorityOnly || item.priority === "High") &&
          `${item.customer} ${item.title} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [availableComplaints, filter, priorityOnly, query],
  );

  function openDraft() {
    setDraft(draftResponse(selected));
    setDraftOpen(true);
  }

  async function reviewWithModel() {
    setModelLoading(true);
    try {
      setModelResult(await classifyComplaint(selected.body));
      setReviewOpen(true);
    } catch (error) {
      toast.error("Model API unavailable", { description: error instanceof Error ? error.message : "Start the FastAPI service on port 8000." });
    } finally {
      setModelLoading(false);
    }
  }

  return (
    <>
      <section className="grid min-h-[560px] overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-glass backdrop-blur-xl xl:grid-cols-[minmax(440px,1.15fr)_minmax(360px,.85fr)]">
        <div className="border-b border-glass-border xl:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-center gap-2 border-b border-glass-border px-4 py-3">
            <div className="mr-auto">
              <h2 className="text-sm font-semibold">{heading}</h2>
              <p className="text-[11px] text-muted-foreground">{subheading}</p>
            </div>
            <label className="flex h-9 min-w-44 items-center gap-2 rounded-xl border border-glass-border bg-glass-strong px-3">
              <Search className="size-4 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search complaints" aria-label="Search complaints" />
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Filter options"><SlidersHorizontal className="size-4" /></Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 border-glass-border bg-glass-strong backdrop-blur-2xl">
                <p className="text-sm font-semibold">Feed filters</p>
                <Button variant={priorityOnly ? "subtle" : "glass"} size="sm" className="mt-3 w-full" onClick={() => setPriorityOnly((value) => !value)}>
                  {priorityOnly ? "Showing high priority only" : "Show high priority only"}
                </Button>
                <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => { setPriorityOnly(false); setFilter("All"); setQuery(""); }}>
                  Reset filters
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-glass-border px-4 py-2">
            {(["All", "Negative", "Neutral", "Positive"] as const).map((item) => (
              <Button key={item} onClick={() => setFilter(item)} variant={filter === item ? "subtle" : "ghost"} size="sm">{item}</Button>
            ))}
          </div>

          <div className="max-h-[480px] overflow-y-auto p-2">
            {visible.map((item) => (
              <button key={item.id} onClick={() => onSelect(item.id)} className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-3 text-left transition", selected.id === item.id ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-glass-strong")}>
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">{item.initials}</span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2"><strong className="truncate text-sm">{item.customer}</strong><span className="text-[10px] text-muted-foreground">{item.time}</span></span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.title}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{item.category}</span>
                    <SentimentPill sentiment={item.sentiment} />
                    <span className="text-[10px] text-muted-foreground">→ {routeComplaint(item).name}</span>
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
            {visible.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground">No matching complaints</div>}
          </div>
        </div>

        <div className="bg-glass-strong/60">
          <div className="flex items-center justify-between border-b border-glass-border px-5 py-4">
            <div>
              <span className="text-[11px] font-medium text-muted-foreground">{selected.id}</span>
              <h2 className="mt-0.5 font-display text-lg font-bold">{selected.customer}</h2>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", selected.priority === "High" ? "bg-negative/10 text-negative" : selected.priority === "Medium" ? "bg-warning/10 text-warning" : "bg-positive/10 text-positive")}>{selected.priority} priority</span>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Customer complaint</p>
              <p className="mt-2 text-sm leading-6">“{selected.body}”</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-glass-border bg-glass p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground"><Tags className="size-3" />Classification</p>
                <p className="mt-2 text-sm font-semibold">{selected.category}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{selected.issue}</p>
              </div>
              <div className="rounded-xl border border-glass-border bg-glass p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground"><MessageSquareText className="size-3" />Sentiment</p>
                <div className="mt-2"><SentimentPill sentiment={selected.sentiment} /></div>
              </div>
            </div>

            <div className="rounded-xl border border-glass-border bg-glass p-4">
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Routed to</p>
              <p className="mt-2 text-sm font-semibold">{team.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Case owner {team.owner} · responds within {team.slaHours}h</p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/8 p-4">
              <div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><p className="text-xs font-bold text-primary">Recommended next action</p></div>
              <p className="mt-2 text-sm leading-6">{recommendedAction(selected)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => toast.success(`Assigned to ${team.name}`, { description: `${selected.id} is with ${team.owner}, due in ${team.slaHours}h.` })}>Apply action</Button>
                <Button variant="glass" size="sm" onClick={openDraft}>Draft response</Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-glass-border pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />Classified in 184ms</span>
              <Button variant="ghost" size="sm" onClick={reviewWithModel} disabled={modelLoading}><CircleHelp className="size-3.5" />{modelLoading ? "Checking model" : "Review with model"}</Button>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={draftOpen} onOpenChange={setDraftOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Draft response · {selected.id}</DialogTitle>
            <DialogDescription>Generated from the classification and sentiment, then routed to {team.name}.</DialogDescription>
          </DialogHeader>
          <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={14} className="text-sm leading-6" aria-label="Draft message" />
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="glass" onClick={() => setDraft(draftResponse(selected))}>Regenerate</Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => { setDraftOpen(false); toast("Draft saved", { description: `Kept as a draft on ${selected.id}.` }); }}>Save draft</Button>
              <Button onClick={() => { setDraftOpen(false); toast.success(`Reply sent to ${selected.customer}`, { description: `Case ${selected.id} handed to ${team.owner}.` }); }}>
                <Send className="size-4" />Send reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review classification</DialogTitle>
            <DialogDescription>
              {modelResult ? `${modelResult.issue} · ${modelResult.sentiment}.` : `${selected.category} · ${selected.issue} · ${selected.sentiment}.`}
            </DialogDescription>
          </DialogHeader>
          {modelResult && (
            <div className="grid gap-3 rounded-xl border border-glass-border bg-glass p-4 text-sm sm:grid-cols-3">
              <div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Issue category</p><p className="mt-1 font-semibold">{modelResult.issue}</p></div>
              <div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Sentiment</p><p className="mt-1 font-semibold">{modelResult.sentiment}</p></div>
              <div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Suggested priority</p><p className="mt-1 font-semibold">{modelResult.priority}</p></div>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setReviewOpen(false); toast.success("Marked as correct", { description: "Feedback stored for model monitoring." }); }}>Looks correct</Button>
            <Button variant="glass" size="sm" onClick={() => { setReviewOpen(false); toast("Flagged for retraining", { description: `${selected.id} added to the review queue.` }); }}>Flag as wrong</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
