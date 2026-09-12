import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { complaints, complaintsToCsv } from "@/lib/complaints";

export function ExportButton({ label = "Export" }: { label?: string }) {
  function handleExport() {
    const blob = new Blob([complaintsToCsv(complaints)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "supportsense-complaints.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", { description: `${complaints.length} complaints downloaded as CSV.` });
  }

  return (
    <Button variant="glass" onClick={handleExport}>
      <FileDown className="size-4" />
      {label}
    </Button>
  );
}
