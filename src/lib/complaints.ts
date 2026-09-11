export type Sentiment = "Negative" | "Neutral" | "Positive";

export type Complaint = {
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

export const complaints: Complaint[] = [
  { id: "C-20418", customer: "Ava Richards", initials: "AR", title: "Charged twice for the same wire transfer", body: "I was charged twice for a single international wire transfer. One payment was completed, but the duplicate is still pending after five days. I need this reversed immediately because it has put my account below its minimum balance.", category: "Money transfer", issue: "Duplicate transaction", sentiment: "Negative", confidence: 96, priority: "High", time: "8m" },
  { id: "C-20417", customer: "Marcus Lee", initials: "ML", title: "Card declined while travelling overseas", body: "My card keeps getting declined overseas even though the app shows enough available balance. I informed the bank about my travel before leaving and cannot reach anyone by phone.", category: "Credit card", issue: "Card declined", sentiment: "Negative", confidence: 91, priority: "High", time: "21m" },
  { id: "C-20416", customer: "Priya Shah", initials: "PS", title: "Disputed charge resolved within a day", body: "Thank you for resolving the disputed card charge so quickly. The support specialist kept me informed and the refund is already visible in my account.", category: "Credit card", issue: "Dispute resolved", sentiment: "Positive", confidence: 94, priority: "Low", time: "43m" },
  { id: "C-20415", customer: "Tom Becker", initials: "TB", title: "Cannot find the latest foreign exchange rate", body: "Where can I find today's foreign exchange rate in the app? The rate shown on my statement seems different from the one I saw before confirming.", category: "Money transfer", issue: "Exchange rate", sentiment: "Neutral", confidence: 87, priority: "Medium", time: "1h" },
  { id: "C-20414", customer: "Nandi Dlamini", initials: "ND", title: "Mortgage payment marked as late", body: "My mortgage debit went through on the due date, but it has been marked late and a fee was added. Please correct the record before it affects my credit profile.", category: "Mortgage", issue: "Incorrect late fee", sentiment: "Negative", confidence: 93, priority: "High", time: "2h" },
];

export const fallbackComplaint: Complaint = complaints[0] ?? {
  id: "C-00000", customer: "Unknown", initials: "—", title: "Complaint unavailable", body: "No complaint was selected.", category: "Unclassified", issue: "Unavailable", sentiment: "Neutral", confidence: 0, priority: "Low", time: "now",
};

export type Team = {
  id: string;
  name: string;
  owner: string;
  focus: string;
  slaHours: number;
  categories: string[];
};

export const teams: Team[] = [
  { id: "payments", name: "Payments resolution", owner: "Lerato Mokoena", focus: "Transfers, duplicate debits, FX disputes", slaHours: 4, categories: ["Money transfer"] },
  { id: "cards", name: "Card services", owner: "Daniel Okafor", focus: "Card declines, fraud holds, chargebacks", slaHours: 6, categories: ["Credit card"] },
  { id: "lending", name: "Lending & mortgage care", owner: "Sarah Whitfield", focus: "Mortgage servicing, fees, credit records", slaHours: 12, categories: ["Mortgage"] },
  { id: "frontline", name: "Frontline support", owner: "Aisha Bello", focus: "General questions and product guidance", slaHours: 24, categories: [] },
];

export const escalationTeam: Team = teams[0]!;

export function routeComplaint(complaint: Complaint): Team {
  const byCategory = teams.find((team) => team.categories.includes(complaint.category));
  if (complaint.priority === "High" && complaint.sentiment === "Negative") {
    return byCategory ?? escalationTeam;
  }
  if (complaint.sentiment === "Positive") {
    return teams.find((team) => team.id === "frontline") ?? escalationTeam;
  }
  return byCategory ?? teams.find((team) => team.id === "frontline") ?? escalationTeam;
}

export function recommendedAction(complaint: Complaint): string {
  if (complaint.priority === "High") return "Escalate to the specialist resolution team and acknowledge the customer within 30 minutes.";
  if (complaint.sentiment === "Positive") return "Close the case and tag this interaction as a positive service outcome.";
  return "Send the relevant help article and request the transaction reference for review.";
}

export function draftResponse(complaint: Complaint): string {
  const team = routeComplaint(complaint);
  const firstName = complaint.customer.split(" ")[0];

  if (complaint.sentiment === "Positive") {
    return `Hi ${firstName},\n\nThank you so much for the kind feedback about how your ${complaint.issue.toLowerCase()} was handled. I have shared your note with ${team.owner} and the ${team.name} team.\n\nIf anything else comes up on your account, reply to this message and we will pick it up straight away.\n\nWarm regards,\nSupportSense Customer Care\nReference ${complaint.id}`;
  }

  const urgency = complaint.priority === "High"
    ? `I have escalated this to ${team.name} as a priority case and you will hear from us within ${Math.min(team.slaHours, 4)} hours.`
    : `I have passed this to ${team.name} and we will come back to you within ${team.slaHours} hours.`;

  return `Hi ${firstName},\n\nThank you for telling us about "${complaint.title.toLowerCase()}". I am sorry for the trouble this has caused, and I can confirm we have logged it as a ${complaint.category.toLowerCase()} issue (${complaint.issue.toLowerCase()}).\n\n${urgency} In the meantime, could you confirm the reference or date of the transaction so we can complete the review faster?\n\nYou can track progress with reference ${complaint.id}.\n\nKind regards,\nSupportSense Customer Care`;
}

export const insights = [
  { id: "duplicate-transfers", title: "Duplicate transfer complaints are up 38%", detail: "27 related complaints since Monday, mostly international transfers created between 14:00 and 17:00.", team: "payments", volume: 27, trend: "+38%" },
  { id: "travel-declines", title: "Travel card declines cluster on weekends", detail: "14 customers reported declines abroad despite registered travel notices, peaking Saturday evening.", team: "cards", volume: 14, trend: "+21%" },
  { id: "late-fee-errors", title: "Mortgage late-fee errors after batch run", detail: "9 complaints trace back to the overnight batch posting payments a day later than received.", team: "lending", volume: 9, trend: "+12%" },
  { id: "fx-clarity", title: "Customers cannot locate FX rates", detail: "18 neutral questions about where today's exchange rate appears before confirming a transfer.", team: "frontline", volume: 18, trend: "+8%" },
  { id: "positive-disputes", title: "Dispute resolution praise rising", detail: "Positive sentiment on card disputes is up as same-day refunds increase.", team: "cards", volume: 22, trend: "+15%" },
  { id: "call-wait", title: "Phone wait times drive repeat complaints", detail: "11 customers complained twice after failing to reach the contact centre by phone.", team: "frontline", volume: 11, trend: "+6%" },
];

export const metrics = [
  { label: "Open complaints", value: "342", note: "+12.4%", tone: "negative" as const },
  { label: "Avg. response time", value: "2.4h", note: "31% faster", tone: "positive" as const },
  { label: "Negative sentiment", value: "24%", note: "+2.1 pts", tone: "negative" as const },
  { label: "Auto-classified", value: "98.7%", note: "1,284 today", tone: "primary" as const },
];

export const categoryBreakdown = [
  { category: "Money transfer", volume: 118, negative: 71, team: "payments" },
  { category: "Credit card", volume: 96, negative: 52, team: "cards" },
  { category: "Mortgage", volume: 64, negative: 44, team: "lending" },
  { category: "Account access", volume: 41, negative: 18, team: "frontline" },
  { category: "Fees & charges", volume: 23, negative: 14, team: "frontline" },
];

export function complaintsToCsv(rows: Complaint[]): string {
  const header = ["id", "customer", "title", "category", "issue", "sentiment", "confidence", "priority", "routed_team"];
  const body = rows.map((row) => [row.id, row.customer, row.title, row.category, row.issue, row.sentiment, `${row.confidence}%`, row.priority, routeComplaint(row).name]
    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","));
  return [header.join(","), ...body].join("\n");
}
