"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBookings, fetchStaff, fetchBranches, QK } from "@/lib/queries";
import type { Booking, Staff, Branch } from "@/lib/types";
import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CHART_COLORS, formatDate } from "@/lib/utils";

const today = new Date().toISOString().slice(0, 10);

export default function StaffPage() {
  const [branchFilter, setBranchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: QK.branches(),
    queryFn: fetchBranches,
    staleTime: 10 * 60_000,
  });

  const { data: staff = [] } = useQuery<Staff[]>({
    queryKey: QK.staff(),
    queryFn: fetchStaff,
    staleTime: 5 * 60_000,
  });

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: QK.bookings({}),
    queryFn: () => fetchBookings(),
    staleTime: 60_000,
  });

  // Filter by branch
  const filteredBranches = branchFilter
    ? branches.filter((b) => b.name === branchFilter)
    : branches;

  // ✅ FIX: "Most Requested" = staffRequested=true only
  const requestedCounts = bookings
    .filter((b) => b.staffRequested && b.staff_name)
    .reduce<Record<string, number>>((acc, b) => {
      if (b.staff_name) acc[b.staff_name] = (acc[b.staff_name] ?? 0) + 1;
      return acc;
    }, {});

  const mostRequested = Object.entries(requestedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // ✅ FIX: "Top by Completed Bookings" = completed status
  const completedCounts = bookings
    .filter((b) => b.status === "completed" && b.staff_name)
    .reduce<Record<string, number>>((acc, b) => {
      if (b.staff_name) acc[b.staff_name] = (acc[b.staff_name] ?? 0) + 1;
      return acc;
    }, {});

  const topByCompleted = Object.entries(completedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Workload on selected date
  const dayBookings = bookings.filter(
    (b) =>
      b.date === dateFilter &&
      (b.status === "confirmed" || b.status === "completed") &&
      b.staff_name,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
        Staff Management & Availability
      </h3>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
            background: "var(--color-surface)",
          }}
        >
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
            background: "var(--color-surface)",
          }}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
            background: "var(--color-surface)",
          }}
        />
        <span style={{ fontSize: "13px", color: "var(--color-sub)", alignSelf: "center" }}>→</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "13px",
            background: "var(--color-surface)",
          }}
        />
      </div>

      {/* CRM charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* <Card>
          <CardHeader>
           
            <span style={{ fontWeight: 600, fontSize: "14px" }}>⭐ Client-Requested Staff</span>
            <span style={{ fontSize: "11px", color: "var(--color-sub)" }}>
              Explicitly chosen during booking
            </span>
          </CardHeader> 
           <CardContent>
            {isLoading ? <Skeleton style={{ height: "160px" }} /> :
             mostRequested.length === 0 ? (
              <EmptyState icon="⭐" title="No explicit staff requests yet" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(120, mostRequested.length * 28)}>
                <BarChart data={mostRequested} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: unknown) => [String(v ?? 0), "Requests"]} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent> 
        </Card> */}

        <Card>
          <CardHeader>
            <span style={{ fontWeight: 600, fontSize: "14px" }}>🏆 Top Staff by Completed Bookings</span>
            <span style={{ fontSize: "11px", color: "var(--color-sub)" }}>All time · completed</span>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton style={{ height: "160px" }} /> :
             topByCompleted.length === 0 ? (
              <EmptyState icon="🏆" title="No completed bookings yet" />
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(120, topByCompleted.length * 28)}>
                <BarChart data={topByCompleted} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: unknown) => [String(v ?? 0), "Completed"]} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill={CHART_COLORS[3]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-branch workload */}
      {filteredBranches.map((branch) => {
        const branchStaff = staff.filter((s) => s.branch_id === branch.id);
        const branchDayBookings = dayBookings.filter((b) => b.branch === branch.name);

        const workloadData = branchStaff
          .map((s) => ({
            name: s.name,
            bookings: branchDayBookings.filter((b) => b.staff_name === s.name).length,
          }))
          .filter((s) => s.bookings > 0);

        return (
          <Card key={branch.id}>
            <CardHeader>
              <span style={{ fontWeight: 600 }}>🏪 {branch.name}</span>
              <span style={{ fontSize: "12px", color: "var(--color-sub)" }}>
                Staff Workload on {formatDate(dateFilter)}
              </span>
            </CardHeader>
            <CardContent>
              {workloadData.length === 0 ? (
                <EmptyState icon="📊" title="No bookings on this date" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "24px", alignItems: "center" }}>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={workloadData} dataKey="bookings" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                        {workloadData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown, n: unknown) => [`${v} bookings`, n as string]} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: "11px" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {branchStaff.map((s) => {
                      const todayBookings = branchDayBookings.filter((b) => b.staff_name === s.name);
                      return (
                        <div
                          key={s.id}
                          style={{
                            border: "1px solid var(--color-border)",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            background: "var(--color-canvas)",
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>{s.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--color-sub)", marginBottom: "6px" }}>{s.role}</div>
                          {todayBookings.length === 0 ? (
                            <div style={{ fontSize: "12px", color: "var(--color-muted)" }}>No bookings today</div>
                          ) : (
                            todayBookings.map((b) => (
                              <div key={b.id} style={{ fontSize: "12px", color: "var(--color-rose)", marginBottom: "2px" }}>
                                {b.time} – {b.endTime ?? "?"} · {b.service} · {b.customer_name}
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
