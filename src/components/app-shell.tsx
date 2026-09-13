import { Link } from "@tanstack/react-router";
import { Bell, Inbox, LayoutDashboard, Lightbulb, Settings, Tags } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { complaints, routeComplaint } from "@/lib/complaints";

const navItems = [
  { label: "Overview", to: "/", icon: LayoutDashboard, count: undefined },
  { label: "Complaints", to: "/complaints", icon: Inbox, count: "342" },
  { label: "Categories", to: "/categories", icon: Tags, count: undefined },
  { label: "Insights", to: "/insights", icon: Lightbulb, count: "6" },
] as const;

function NotificationsMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 border-glass-border bg-glass-strong p-0 backdrop-blur-2xl">
        <div className="border-b border-glass-border px-4 py-3">
          <p className="text-sm font-semibold">New classified complaints</p>
          <p className="text-[11px] text-muted-foreground">Routed automatically by CasePilot</p>
        </div>
        <ul className="max-h-72 overflow-y-auto p-2">
          {complaints.slice(0, 4).map((item) => (
            <li key={item.id}>
              <Link
                to="/complaints"
                search={{ id: item.id }}
                className="block rounded-xl p-3 transition hover:bg-glass"
              >
                <span className="flex items-center justify-between gap-2">
                  <strong className="truncate text-xs">{item.customer}</strong>
                  <span className="text-[10px] text-muted-foreground">{item.time}</span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{item.title}</span>
                <span className="mt-1 block text-[10px] font-medium text-primary">→ {routeComplaint(item).name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground lg:flex">
      <aside className="border-b border-glass-border bg-glass-strong backdrop-blur-2xl lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex h-17 items-center justify-between px-5 lg:border-b lg:border-glass-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-gradient text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25">SS</div>
            <div>
              <div className="font-display text-[15px] font-bold">CasePilot</div>
              <div className="text-[11px] text-muted-foreground">Complaint intelligence</div>
            </div>
          </Link>
          <NotificationsMenu />
        </div>

        <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:p-4">
          <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase text-muted-foreground lg:block">Workspace</p>
          {navItems.map(({ label, to, icon: Icon, count }) => (
            <Link
              key={label}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="mb-1 flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition hover:bg-glass hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary lg:w-full"
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {count && <span className="ml-auto hidden text-xs lg:inline">{count}</span>}
            </Link>
          ))}
        </nav>

        <div className="hidden px-4 lg:absolute lg:inset-x-0 lg:bottom-5 lg:block">
          <div className="rounded-2xl border border-glass-border bg-glass p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Model connection</span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-positive"><span className="size-1.5 rounded-full bg-positive" />Ready</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">FastAPI endpoint ready to connect</p>
            <Button asChild variant="glass" size="sm" className="mt-3 w-full">
              <Link to="/settings"><Settings className="size-3.5" />Configure</Link>
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <header className="flex min-h-17 flex-wrap items-center gap-3 border-b border-glass-border bg-glass px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mr-auto">
            <h1 className="font-display text-lg font-bold">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          {actions}
        </header>
        <div className="space-y-5 p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
