"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTenants, fetchSuperStats } from "@/lib/queries";
import type { Tenant } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useState } from "react";

export default function SuperDashboardPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  // Get refetch functions from useQuery
  const { 
    data: tenants, 
    isLoading, 
    refetch: refetchTenants 
  } = useQuery<Tenant[]>({
    queryKey: ["tenants"],
    queryFn: fetchTenants,
    staleTime: 0, // Data is considered stale immediately
  });

  const { 
    data: stats, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ["superStats"],
    queryFn: fetchSuperStats,
    staleTime: 0,
  });

  // ✅ Mutation for activating/suspending salons
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/super-admin/api/tenants/${encodeURIComponent(id)}/status`, {
        status: status === "active" ? "suspended" : "active",
      }),
    onSuccess: (_, variables) => { 
      const newStatus = variables.status === "active" ? "suspended" : "active";
      toast.success(`Salon ${newStatus === "active" ? "activated" : "suspended"} successfully!`);
      // ✅ Force refetch after status change
      refetchTenants();
      refetchStats();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const tenantsArray = Array.isArray(tenants) ? tenants : [];
  const activeTenants = tenantsArray.filter(t => t.status === "active").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fc",
        padding: "24px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "#fff",
            padding: "20px 28px",
            borderRadius: "16px",
            marginBottom: "28px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1e2a5e", margin: 0 }}>
            🏢 Super Admin Portal
          </h1>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => {
                refetchTenants();
                refetchStats();
                toast.info("Refreshing data...");
              }}
              style={{
                background: "#e0e7ff",
                color: "#1e3a8a",
                padding: "8px 16px",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              🔄 Refresh
            </button>
            <a
              href="/super-admin/logout"
              style={{
                background: "#f1f3f5",
                color: "#c0392b",
                padding: "8px 20px",
                textDecoration: "none",
                borderRadius: "40px",
                fontWeight: 500,
                fontSize: "13px",
                border: "1px solid #ffe2df",
              }}
            >
              🚪 Logout
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginBottom: "28px" }}>
          {[
            { label: "📋 Total Salons", value: stats?.total_tenants ?? tenantsArray.length },
            { label: "✅ Active Salons", value: stats?.active_tenants ?? activeTenants },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", padding: "24px 20px", borderRadius: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#5b6e8c", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              <div style={{ fontSize: "40px", fontWeight: 800, color: "#1e3a8a", marginTop: "8px" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 28px",
              borderBottom: "1px solid #eef2f8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h3 style={{ fontWeight: 600, fontSize: "18px", color: "#0b2b44", margin: 0 }}>
              🏪 Managed Salons
            </h3>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "#1f3a6b",
                color: "#fff",
                padding: "10px 24px",
                border: "none",
                borderRadius: "40px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "13px",
              }}
            >
              + New Salon
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1,2,3].map(i => <Skeleton key={i} style={{ height: "44px" }} />)}
            </div>
          ) : tenantsArray.length === 0 ? (
            <EmptyState icon="🏪" title="No salons registered yet" description='Click "+ New Salon" to get started.' />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr>
                    {["ID", "Salon Name", "Owner", "Email", "Phone", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#2c4c7c", background: "#fafcff", borderBottom: "1px solid #ecf3fa" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenantsArray.map((t) => {
                    const tenantId = t.tenant_id || t.id || "";
                    return (
                      <tr key={tenantId} style={{ borderBottom: "1px solid #ecf3fa" }}>
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px" }}>{tenantId}</td>
                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>{t.salon_name}</td>
                        <td style={{ padding: "14px 16px" }}>{t.owner_name}</td>
                        <td style={{ padding: "14px 16px", fontSize: "12px" }}>{t.email}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px" }}>{t.phone}</td>
                        <td style={{ padding: "14px 16px" }}><Badge status={t.status} /></td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            onClick={() => toggleMutation.mutate({ id: tenantId, status: t.status })}
                            disabled={toggleMutation.isPending}
                            style={{
                              background: t.status === "active" ? "#fee2e2" : "#e0f2fe",
                              color: t.status === "active" ? "#b91c1c" : "#0f5c3b",
                              border: "none",
                              padding: "5px 14px",
                              borderRadius: "30px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {t.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: "12px 20px", background: "#eef2ff", fontSize: "11px", color: "#2c4f7c", textAlign: "center" }}>
            ⚡ Note: Creating a salon does NOT auto-create any branch or default staff.
          </div>
        </div>
      </div>

      {showModal && (
        <CreateTenantModal 
          onClose={() => setShowModal(false)} 
          onCreated={() => { 
            // ✅ Force refetch after creating a new salon
            refetchTenants(); 
            refetchStats(); 
            setShowModal(false); 
          }} 
        />
      )}
    </div>
  );
}

function CreateTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ salon_name: "", owner_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) { setForm(f => ({ ...f, [key]: value })); }

  async function handleCreate() {
    if (!form.salon_name || !form.owner_name || !form.email || !form.phone) {
      toast.error("All fields except password are required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/super-admin/api/tenants", form);
      toast.success(`Salon "${form.salon_name}" created!`);
      onCreated(); // ✅ This triggers refetch
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create salon");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: "24px", width: "90%", maxWidth: "480px", padding: "28px 32px", boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "20px", color: "#0f2e4a" }}>✨ Register New Salon</h3>

        {[
          { id: "salon_name", label: "🏷️ Salon Name *", placeholder: "e.g., Royal Glam Studio" },
          { id: "owner_name", label: "👤 Owner Full Name *", placeholder: "Full name" },
          { id: "email", label: "📧 Admin Email *", placeholder: "salon@example.com", type: "email" },
          { id: "phone", label: "📞 Phone *", placeholder: "+92 300 1234567", type: "tel" },
          { id: "password", label: "🔑 Password (optional)", placeholder: "Leave blank for auto-generated", type: "password" },
        ].map(f => (
          <div key={f.id} style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#2c3e66", marginBottom: "6px" }}>{f.label}</label>
            <input
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={form[f.id as keyof typeof form]}
              onChange={(e) => set(f.id, e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontSize: "13px", outline: "none" }}
            />
          </div>
        ))}

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", background: "#f1f3f5", border: "none", borderRadius: "40px", cursor: "pointer", fontWeight: 500, fontSize: "13px" }}>
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{ padding: "10px 24px", background: "#1f3a6b", color: "#fff", border: "none", borderRadius: "40px", cursor: "pointer", fontWeight: 500, fontSize: "13px" }}
          >
            {loading ? "Creating…" : "Create Salon"}
          </button>
        </div>
      </div>
    </div>
  );
}