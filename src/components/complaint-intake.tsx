import { BrainCircuit, CheckCircle2, LoaderCircle, Send, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { categoryForIssue } from "@/lib/complaints";
import { classifyComplaint, type ModelClassification } from "@/lib/model-api";
import { cn } from "@/lib/utils";

const exampleComplaint = "My card was declined while travelling overseas even though I have enough balance.";

export function ComplaintIntake() {
  const [customer, setCustomer] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<ModelClassification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitComplaint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.trim().length < 3) {
      setError("Enter at least a few words so the model can classify the complaint.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setResult(await classifyComplaint(text.trim(), customer.trim()));
      window.dispatchEvent(new CustomEvent("complaint-created"));
      toast.success("Complaint classified", { description: "The model returned a live prediction." });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not reach the model API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-5 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 shadow-glass lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)]">
      <form onSubmit={submitComplaint} className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><BrainCircuit className="size-5" /></div>
          <div>
            <h2 className="text-sm font-semibold">Classify a new complaint</h2>
            <p className="mt-1 text-xs text-muted-foreground">Paste a customer message and get an issue, sentiment, and priority prediction from the model.</p>
          </div>
        </div>
        <input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Customer name (optional)" aria-label="Customer name" className="h-10 w-full rounded-xl border border-glass-border bg-glass-strong px-3 text-sm outline-none placeholder:text-muted-foreground" />
        <Textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Example: I was charged twice for the same transfer..." rows={4} aria-label="New complaint text" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setText(exampleComplaint)} className="text-xs font-medium text-primary hover:underline">Use example complaint</button>
          <Button type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            {loading ? "Classifying" : "Classify complaint"}
          </Button>
        </div>
        {error && <p className="flex items-center gap-2 text-xs text-negative"><TriangleAlert className="size-3.5" />{error}</p>}
      </form>

      <div className="rounded-xl border border-glass-border bg-glass p-4">
        <p className="text-[10px] font-semibold uppercase text-muted-foreground">Live model result</p>
        {result ? (
          <div className="mt-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs text-muted-foreground">Predicted issue</p><p className="mt-1 text-sm font-semibold leading-5">{result.issue}</p></div>
              <CheckCircle2 className="size-4 shrink-0 text-positive" />
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-glass-border pt-3 text-xs">
              <ResultStat label="Category" value={categoryForIssue(result.issue)} />
              <ResultStat label="Sentiment" value={result.sentiment} tone={result.sentiment} />
              <ResultStat label="Priority" value={result.priority} tone={result.priority} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Your classification will appear here after you submit a complaint.</p>
        )}
      </div>
    </section>
  );
}

function ResultStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div><p className="text-[10px] text-muted-foreground">{label}</p><p className={cn("mt-1 font-semibold", tone === "Negative" || tone === "High" ? "text-negative" : tone === "Positive" || tone === "Low" ? "text-positive" : tone === "Neutral" || tone === "Medium" ? "text-warning" : "text-foreground")}>{value}</p></div>;
}