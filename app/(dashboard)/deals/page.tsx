"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeals, QK } from "@/lib/queries";
import type { Deal } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default function DealsPage() {
  const qc = useQueryClient();
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: QK.deals(),
    queryFn: fetchDeals,
    staleTime: 5 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/salon-admin/api/deals/${id}`),
    onSuccess: () => {
      toast.success("Deal deleted");
      qc.invalidateQueries({ queryKey: QK.deals() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Deals &amp; Offers</h3>
        <button style={primaryBtn}>+ Add Deal</button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1,2,3].map(i => <Skeleton key={i} style={{ height: "80px" }} />)}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState icon="🎁" title="No deals yet" description="Create your first promotion to attract clients." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {deals.map((d) => (
            <div
              key={d.id}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{d.title}</div>
                <div style={{ fontSize: "12px", color: "var(--color-sub)" }}>{d.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                <Badge status={d.active ? "active" : "inactive"} />
                <button style={outlineBtn}>Edit</button>
                <button
                  style={{ ...outlineBtn, color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                  onClick={() => deleteMutation.mutate(d.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--color-rose)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const outlineBtn: React.CSSProperties = {
  padding: "6px 14px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  background: "transparent",
  cursor: "pointer",
  color: "var(--color-sub)",
};
