"use client";

import type { Route } from "next";
import { type ComponentType, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Bell, ChartNoAxesCombined, Gem, Layers3, LogOut, Search, Shield, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";
import { DashboardSummary, Invoice, RevenuePoint } from "@/lib/types";

const emptySummary: DashboardSummary = {
  totalRevenue: 0,
  unpaid: 0,
  overdue: 0,
  drafts: 0
};

const statusPalette: Record<Invoice["status"], string> = {
  PAID: "#4f83ff",
  SENT: "#22c55e",
  OVERDUE: "#f97316",
  DRAFT: "#94a3b8"
};

const shellNav: Array<{ id: string; label: string; icon: ComponentType<{ className?: string }>; active: boolean; href: Route }> = [
  { id: "dashboard", label: "Dashboard", icon: ChartNoAxesCombined, active: true, href: "/dashboard" },
  { id: "invoices", label: "Invoices", icon: Layers3, active: false, href: "/invoices" }
];

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function isSameMonth(date: Date, target: Date): boolean {
  return monthKey(date) === monthKey(target);
}

function getPreviousMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

function percentDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getInvoices()
      .then((payload) => setInvoices(payload))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const now = useMemo(() => new Date(), []);
  const previousMonth = useMemo(() => getPreviousMonth(now), [now]);

  const summary = useMemo<DashboardSummary>(() => {
    if (!invoices.length) return emptySummary;
    return invoices.reduce<DashboardSummary>(
      (acc, invoice) => {
        if (invoice.status === "PAID") {
          acc.totalRevenue += invoice.total;
        }
        if (invoice.status === "SENT") {
          acc.unpaid += invoice.total;
        }
        if (invoice.status === "OVERDUE") {
          acc.overdue += invoice.total;
        }
        if (invoice.status === "DRAFT") {
          acc.drafts += 1;
        }
        return acc;
      },
      { ...emptySummary }
    );
  }, [invoices]);

  const sevenDayTrend = useMemo<RevenuePoint[]>(() => {
    const days = 7;
    const buckets = new Map<string, number>();

    for (let index = days - 1; index >= 0; index -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - index);
      const label = day.toLocaleDateString("en-US", { weekday: "short" });
      buckets.set(label, 0);
    }

    invoices
      .filter((invoice) => invoice.status === "PAID")
      .forEach((invoice) => {
        const issued = new Date(invoice.issueDate);
        const label = issued.toLocaleDateString("en-US", { weekday: "short" });
        if (buckets.has(label)) {
          buckets.set(label, Number(((buckets.get(label) ?? 0) + invoice.total).toFixed(2)));
        }
      });

    return Array.from(buckets.entries()).map(([month, amount]) => ({ month, amount }));
  }, [invoices, now]);

  const statusBreakdown = useMemo(() => {
    const stats = invoices.reduce<Record<Invoice["status"], number>>(
      (acc, invoice) => {
        acc[invoice.status] += 1;
        return acc;
      },
      { DRAFT: 0, SENT: 0, PAID: 0, OVERDUE: 0 }
    );

    return [
      { name: "Paid", value: stats.PAID, color: statusPalette.PAID },
      { name: "Sent", value: stats.SENT, color: statusPalette.SENT },
      { name: "Overdue", value: stats.OVERDUE, color: statusPalette.OVERDUE },
      { name: "Draft", value: stats.DRAFT, color: statusPalette.DRAFT }
    ];
  }, [invoices]);
  const visibleStatusBreakdown = useMemo(() => statusBreakdown.filter((item) => item.value > 0), [statusBreakdown]);

  const thisMonthInvoices = useMemo(
    () => invoices.filter((invoice) => isSameMonth(new Date(invoice.issueDate), now)),
    [invoices, now]
  );

  const previousMonthInvoices = useMemo(
    () => invoices.filter((invoice) => isSameMonth(new Date(invoice.issueDate), previousMonth)),
    [invoices, previousMonth]
  );

  const currentMonthRevenue = useMemo(
    () =>
      thisMonthInvoices
        .filter((invoice) => invoice.status === "PAID")
        .reduce((acc, invoice) => acc + invoice.total, 0),
    [thisMonthInvoices]
  );

  const previousMonthRevenue = useMemo(
    () =>
      previousMonthInvoices
        .filter((invoice) => invoice.status === "PAID")
        .reduce((acc, invoice) => acc + invoice.total, 0),
    [previousMonthInvoices]
  );

  const currentAverage = useMemo(() => {
    if (!thisMonthInvoices.length) return 0;
    return thisMonthInvoices.reduce((acc, invoice) => acc + invoice.total, 0) / thisMonthInvoices.length;
  }, [thisMonthInvoices]);

  const previousAverage = useMemo(() => {
    if (!previousMonthInvoices.length) return 0;
    return previousMonthInvoices.reduce((acc, invoice) => acc + invoice.total, 0) / previousMonthInvoices.length;
  }, [previousMonthInvoices]);

  const onTimePaidRatio = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "PAID");
    if (!paid.length) return 0;
    const onTime = paid.filter((invoice) => new Date(invoice.updatedAt) <= new Date(invoice.dueDate)).length;
    return Number(((onTime / paid.length) * 100).toFixed(1));
  }, [invoices]);

  const kpiCards = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(summary.totalRevenue, invoices[0]?.currency ?? "USD"),
        delta: percentDelta(currentMonthRevenue, previousMonthRevenue),
        note: "vs last month"
      },
      {
        title: "Sales Orders",
        value: String(thisMonthInvoices.length),
        delta: percentDelta(thisMonthInvoices.length, previousMonthInvoices.length),
        note: "vs last month"
      },
      {
        title: "Average Invoice Value",
        value: formatCurrency(currentAverage, invoices[0]?.currency ?? "USD"),
        delta: percentDelta(currentAverage, previousAverage),
        note: "vs last month"
      },
      {
        title: "On-time Collections",
        value: `${onTimePaidRatio}%`,
        delta: percentDelta(onTimePaidRatio, 72),
        note: "portfolio score"
      }
    ],
    [
      currentAverage,
      currentMonthRevenue,
      invoices,
      onTimePaidRatio,
      previousAverage,
      previousMonthInvoices.length,
      previousMonthRevenue,
      summary.totalRevenue,
      thisMonthInvoices.length
    ]
  );

  const recentInvoices = invoices.slice(0, 6);
  const displayCurrency = invoices[0]?.currency ?? "USD";

  return (
    <div className="relative overflow-hidden rounded-[2rem] p-0">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-20 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl" />

      <section className="glass-shell relative w-full rounded-[2rem] p-5 md:p-7 lg:p-8">
        <div className="crystal-panel dashboard-fade-up flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-700">
              <Gem className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-900">Synthesis Billing Analytics</p>
              <p className="text-xs text-slate-500">Crystal performance board</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-[280px] max-w-full">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <Input className="h-10 border-white/50 bg-white/40 pl-9 backdrop-blur" placeholder="Search invoices, clients..." />
            </div>
            <button className="crystal-panel hidden h-10 w-10 items-center justify-center rounded-xl md:inline-flex" type="button">
              <Bell className="h-4 w-4 text-slate-600" />
            </button>
            <div className="crystal-panel hidden items-center gap-2 rounded-xl px-3 py-2 md:flex">
              <UserRound className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Vishal Gupta</span>
            </div>
          </div>
        </div>

        {error ? (
          <p className="dashboard-fade-up mt-4 rounded-lg border border-red-300/70 bg-red-100/70 p-3 text-sm text-red-700 backdrop-blur">
            {error}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="crystal-panel dashboard-fade-up hidden rounded-2xl p-3 lg:block">
            <div className="space-y-1">
              {shellNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    href={item.href}
                    key={item.id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      item.active
                        ? "bg-slate-900/90 text-white shadow-lg shadow-slate-900/30"
                        : "text-slate-600 hover:bg-white/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-white/50 bg-white/40 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Collection Focus</p>
              <p className="mt-1">Overdue: {formatCurrency(summary.overdue, displayCurrency)}</p>
              <p>Unpaid: {formatCurrency(summary.unpaid, displayCurrency)}</p>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((card, index) => (
                <Card
                  className="crystal-panel dashboard-fade-up border-white/40 bg-white/35 shadow-none"
                  key={card.title}
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                    <p className={cn("mt-1 text-xs font-medium", card.delta >= 0 ? "text-emerald-600" : "text-rose-600")}>
                      {card.delta >= 0 ? "+" : ""}
                      {card.delta}% {card.note}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
              <Card className="crystal-panel dashboard-fade-up border-white/40 bg-white/35 shadow-none" style={{ animationDelay: "180ms" }}>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Trend (7 days)</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer height="100%" width="100%">
                    <AreaChart data={sevenDayTrend}>
                      <defs>
                        <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#4f83ff" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#4f83ff" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" strokeDasharray="4 4" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ background: "rgba(255,255,255,0.88)", borderRadius: "12px", border: "1px solid #e2e8f0" }}
                        formatter={(value: number | string) => formatCurrency(Number(value), displayCurrency)}
                      />
                      <Area dataKey="amount" fill="url(#revFill)" stroke="#4f83ff" strokeWidth={3} type="monotone" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="crystal-panel dashboard-fade-up border-white/40 bg-white/35 shadow-none" style={{ animationDelay: "240ms" }}>
                <CardHeader>
                  <CardTitle className="text-base">Invoice Mix</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  {visibleStatusBreakdown.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No invoices yet for mix analysis.</div>
                  ) : (
                    <>
                      <ResponsiveContainer height="100%" width="100%">
                        <PieChart>
                          <Pie
                            cx="50%"
                            cy="47%"
                            data={visibleStatusBreakdown}
                            dataKey="value"
                            innerRadius={52}
                            outerRadius={84}
                            paddingAngle={visibleStatusBreakdown.length > 1 ? 3 : 0}
                            stroke="rgba(255,255,255,0.85)"
                            strokeWidth={2}
                          >
                            {visibleStatusBreakdown.map((entry) => (
                              <Cell fill={entry.color} key={entry.name} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "rgba(255,255,255,0.88)",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        {visibleStatusBreakdown.map((item) => (
                          <div className="flex items-center gap-2 text-slate-700" key={item.name}>
                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>
                              {item.name}: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
              <Card className="crystal-panel dashboard-fade-up border-white/40 bg-white/35 shadow-none" style={{ animationDelay: "300ms" }}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Recent Top Invoices</CardTitle>
                  <Badge variant="secondary">{recentInvoices.length} entries</Badge>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Client</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell className="text-sm text-slate-500" colSpan={4}>
                            Loading revenue rows...
                          </TableCell>
                        </TableRow>
                      ) : recentInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-sm text-slate-500" colSpan={4}>
                            No invoices yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium text-slate-800">{invoice.client?.name ?? "Unknown"}</TableCell>
                            <TableCell>{invoice.invoiceNumber}</TableCell>
                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.total, displayCurrency)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="crystal-panel dashboard-fade-up border-white/40 bg-white/35 shadow-none" style={{ animationDelay: "360ms" }}>
                <CardHeader>
                  <CardTitle className="text-base">Active Collection Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-xl border border-white/50 bg-white/40 p-3">
                    <p className="font-medium text-slate-800">Overdue Recovery Flow</p>
                    <p className="text-xs text-slate-500">{summary.overdue > 0 ? "High priority" : "Monitoring mode"}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Target amount: <strong>{formatCurrency(summary.overdue, displayCurrency)}</strong>
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/50 bg-white/40 p-3">
                    <p className="font-medium text-slate-800">Pending Invoice Reminder</p>
                    <p className="text-xs text-slate-500">{summary.unpaid > 0 ? "Auto-send enabled" : "No pending invoices"}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Pipeline value: <strong>{formatCurrency(summary.unpaid, displayCurrency)}</strong>
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/50 bg-white/40 p-3">
                    <p className="font-medium text-slate-800">Draft Completion Queue</p>
                    <p className="text-xs text-slate-500">{summary.drafts} draft invoice(s) waiting for finalization</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <aside className="crystal-panel dashboard-fade-up hidden rounded-2xl p-4 lg:flex lg:flex-col" style={{ animationDelay: "420ms" }}>
            <div className="rounded-xl border border-white/50 bg-white/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Vishal Gupta</p>
                  <p className="text-xs text-slate-600">vishal@invoiceautomation.ai</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-900/20 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-800">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/50 bg-white/40 p-4 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Session</p>
              <p className="mt-1">Status: Active</p>
              <p>Workspace: Invoice Automation</p>
            </div>

            <div className="mt-auto pt-4">
              <Link
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                href="/login"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
