"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBranches,
  fetchStaff,
  fetchRoles,
  fetchTimings,
  fetchGeneral,
  fetchWebhookConfig,
  QK,
} from "@/lib/queries";
import type { Branch, Staff, Role, SalonTimings, WebhookConfig } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

import { BranchDrawer } from "@/components/settings/BranchDrawer";
import { StaffDrawer } from "@/components/settings/StaffDrawer";
import { RoleDrawer } from "@/components/settings/RoleDrawer";

import { ModalShell } from "@/components/ui/ModalShell";
type SettingsTab = "general" | "branches" | "staff" | "roles" | "timings" | "integrations" | "account";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "⚙️ General" },
  { id: "branches", label: "🏪 Branches" },
  { id: "staff", label: "👥 Staff" },
  { id: "roles", label: "🏷️ Roles" },
  { id: "timings", label: "🕐 Salon Hours" },
  { id: "integrations", label: "🔗 Integrations" },
  { id: "account", label: "🔑 Account" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div>
      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>
        Settings
      </h3>

      {/* Sub-tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              border:
                activeTab === t.id
                  ? "1.5px solid var(--color-rose)"
                  : "1.5px solid var(--color-border)",
              background:
                activeTab === t.id
                  ? "var(--color-rose-dim)"
                  : "var(--color-surface)",
              color:
                activeTab === t.id ? "var(--color-rose)" : "var(--color-sub)",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && <GeneralTab />}
      {activeTab === "branches" && <BranchesTab />}
      {activeTab === "staff" && <StaffTab />}
      {activeTab === "roles" && <RolesTab />}
      {activeTab === "timings" && <TimingsTab />}
      {activeTab === "integrations" && <IntegrationsTab />}
      {activeTab === "account" && <AccountTab />}
    </div>
  );
}

/* ─── General Tab ─── */
/* ─── General Tab — Refined with Two-Column Layout (Matching Website Design) ─── */
function GeneralTab() {
  const qc = useQueryClient();
  const { data: general } = useQuery({
    queryKey: QK.general(),
    queryFn: fetchGeneral,
    staleTime: 10 * 60_000,
  });

  const [currency, setCurrency] = useState(general?.currency ?? "Rs.");
  const [botName, setBotName] = useState((general as Record<string, string> | undefined)?.bot_name ?? "");
  const [primaryColor, setPrimaryColor] = useState((general as Record<string, string> | undefined)?.primary_color ?? "#8b4a6b");
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Keep state in sync once general loads
  const generalBotName = (general as Record<string, string> | undefined)?.bot_name ?? "";
  if (generalBotName && botName === "" && generalBotName !== botName) {
    setBotName(generalBotName);
  }

  const tenantId = general?.tenantId ?? "…";
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const widgetUrl = `${origin}/widget/${tenantId}/widget.js`;
  const scriptAttrs = [
    `src="${widgetUrl}"`,
    botName.trim() ? `data-bot-name="${botName.trim()}"` : null,
    primaryColor !== "#8b4a6b" ? `data-primary-color="${primaryColor}"` : null,
  ].filter(Boolean).join("\n  ");
  const scriptTag = `<script\n  ${scriptAttrs}\n></script>`;

  function copyScript() {
    navigator.clipboard.writeText(scriptTag).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyWidgetUrl() {
    navigator.clipboard.writeText(widgetUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put("/salon-admin/api/settings/general", {
        currency,
        bot_name: botName,
        primary_color: primaryColor,
      }),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: QK.general() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const previewName = botName.trim() || general?.owner_name || "Salon Assistant";
  const colorPresets = ["#8b4a6b", "#e11d48", "#7c3aed", "#0ea5e9", "#16a34a", "#ea580c"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Two-column grid for better space utilization */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
      }}>
        
        {/* LEFT COLUMN - Currency and Widget Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Currency Card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
            }}
          >
            <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>💱 Currency</h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-sub)",
                marginBottom: "16px",
              }}
            >
              Shown before all prices in the panel and bot replies.
            </p>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "6px",
              }}
            >
              Currency Symbol / Prefix
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "13px",
                background: "var(--color-surface)",
                marginBottom: "20px",
              }}
            >
              <option value="Rs.">Rs. — Pakistani Rupee</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="SAR">SAR — Saudi Riyal</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
              <option value="INR">INR — Indian Rupee</option>
            </select>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              style={primaryBtn}
            >
              {saveMutation.isPending ? "Saving…" : "Save Settings"}
            </button>
          </div>

          {/* Widget Customization Card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
            }}
          >
            <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>🎨 Widget Appearance</h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-sub)",
                marginBottom: "20px",
              }}
            >
              Customize how your chat widget looks.
            </p>

            <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "4px", color: "var(--color-sub)" }}>
              Display Name
            </label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder={general?.owner_name ?? "e.g. Glamour Studio"}
              style={{ 
                width: "100%", 
                padding: "9px 12px", 
                border: "1px solid var(--color-border)", 
                borderRadius: "8px", 
                fontSize: "13px", 
                background: "var(--color-surface)", 
                marginBottom: "16px", 
                boxSizing: "border-box" 
              }}
            />

            <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "var(--color-sub)" }}>
              Widget Color
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ 
                  width: "40px", 
                  height: "34px", 
                  border: "1px solid var(--color-border)", 
                  borderRadius: "6px", 
                  cursor: "pointer", 
                  padding: "2px", 
                  flexShrink: 0 
                }} 
              />
              <input 
                type="text" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ 
                  width: "100px", 
                  padding: "7px 10px", 
                  border: "1px solid var(--color-border)", 
                  borderRadius: "8px", 
                  fontSize: "12px", 
                  fontFamily: "monospace", 
                  background: "var(--color-surface)" 
                }} 
              />
              {colorPresets.map((c) => (
                <button 
                  key={c} 
                  onClick={() => setPrimaryColor(c)} 
                  title={c}
                  style={{ 
                    width: "24px", 
                    height: "24px", 
                    borderRadius: "50%", 
                    background: c, 
                    border: primaryColor === c ? "2px solid var(--color-text)" : "2px solid var(--color-border)", 
                    cursor: "pointer", 
                    flexShrink: 0 
                  }} 
                />
              ))}
            </div>

            <button 
              onClick={() => saveMutation.mutate()} 
              disabled={saveMutation.isPending} 
              style={primaryBtn}
            >
              {saveMutation.isPending ? "Saving…" : "Save Widget Settings"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - Preview and Embed Code */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Live Preview Card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
            }}
          >
            <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>👁️ Live Preview</h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-sub)",
                marginBottom: "20px",
              }}
            >
              This is how your widget will appear on your website.
            </p>

            <div style={{ 
              background: "#f1f5f9", 
              border: "1px solid var(--color-border)", 
              borderRadius: "12px", 
              padding: "16px 16px 60px", 
              position: "relative", 
              minHeight: "180px" 
            }}>
              <p style={{ fontSize: "11px", color: "var(--color-sub)", margin: 0 }}>Website preview</p>
              <div style={{ 
                position: "absolute", 
                bottom: "12px", 
                right: "12px", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "flex-end", 
                gap: "8px" 
              }}>
                <div style={{ 
                  background: "#fff", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "12px", 
                  width: "210px", 
                  overflow: "hidden", 
                  boxShadow: "0 4px 16px rgba(0,0,0,.12)" 
                }}>
                  <div style={{ 
                    background: primaryColor, 
                    color: "#fff", 
                    padding: "10px 12px", 
                    fontSize: "12px", 
                    fontWeight: 600, 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <span>{previewName}</span>
                    <span style={{ opacity: 0.7, cursor: "default", fontSize: "14px" }}>✕</span>
                  </div>
                  <div style={{ padding: "10px 12px", fontSize: "11px", color: "#555" }}>
                    Hi! How can I help you today? 👋
                  </div>
                </div>
                <div style={{ 
                  width: "44px", 
                  height: "44px", 
                  borderRadius: "50%", 
                  background: primaryColor, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "20px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,.2)", 
                  cursor: "default" 
                }}>
                  💬
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code Card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "24px",
            }}
          >
            <h4 style={{ fontWeight: 600, marginBottom: "4px" }}>📋 Embed on Your Website</h4>
            <p
              style={{
                fontSize: "12px",
                color: "var(--color-sub)",
                marginBottom: "16px",
              }}
            >
              Copy and paste this code just before the closing <code style={inlineCode}>&lt;/body&gt;</code> tag.
            </p>

            {/* Widget URL */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "var(--color-sub)" }}>
                Widget URL
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f8fafc",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              >
                <code
                  style={{
                    fontSize: "11px",
                    color: "#6366f1",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {widgetUrl}
                </code>
                <button
                  onClick={copyWidgetUrl}
                  style={{
                    padding: "4px 12px",
                    background: copiedUrl ? "#22c55e" : "#64748b",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copiedUrl ? "Copied!" : "Copy"}
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "var(--color-sub)", marginTop: "6px" }}>
                Your Tenant ID: <strong style={{ color: "var(--color-text)" }}>{tenantId}</strong>
              </p>
            </div>

            {/* Script Tag */}
            <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "6px", color: "var(--color-sub)" }}>
              Embed Script Tag
            </label>
            <div style={{ 
              position: "relative", 
              background: "#1e1e2e", 
              borderRadius: "8px", 
              padding: "14px 16px",
              marginBottom: "16px",
            }}>
              <pre style={{ 
                fontSize: "11px", 
                color: "#a6e3a1", 
                wordBreak: "break-all", 
                margin: 0, 
                paddingRight: "70px", 
                whiteSpace: "pre-wrap", 
                fontFamily: "monospace" 
              }}>
                {scriptTag}
              </pre>
              <button 
                onClick={copyScript}
                style={{ 
                  position: "absolute", 
                  top: "10px", 
                  right: "10px", 
                  padding: "4px 12px", 
                  background: copied ? "#22c55e" : "#667eea", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "6px", 
                  fontSize: "11px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* WordPress Note */}
            <div
              style={{
                background: "#fef9c3",
                border: "1px solid #fde047",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <p style={{ fontSize: "12px", color: "#854d0e", margin: 0 }}>
                <strong>WordPress?</strong> Use the included plugin instead —
                install{" "}
                <code style={{ ...inlineCode, background: "#fde04766" }}>
                  wp-plugin/salon-bot-widget.php
                </code>{" "}
                and set your bot server URL in the plugin settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inlineCode: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "11px",
  background: "#f1f5f9",
  padding: "1px 5px",
  borderRadius: "4px",
  color: "#475569",
};

/* ─── Branches Tab ─── */

function BranchesTab() {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: QK.branches(),
    queryFn: fetchBranches,
    staleTime: 10 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/salon-admin/api/settings/branches/${id}`),
    onSuccess: () => {
      toast.success("Branch deleted");
      qc.invalidateQueries({ queryKey: QK.branches() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAdd() {
    setEditingBranch(null);
    setDrawerOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingBranch(branch);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingBranch(null);
  }

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ fontWeight: 600 }}>Branch Management</h4>
          <button style={primaryBtn} onClick={openAdd}>
            + Add Branch
          </button>
        </div>

        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "20px" }}>
              <Skeleton style={{ height: "44px" }} />
            </div>
          ) : branches.length === 0 ? (
            <EmptyState icon="🏪" title="No branches yet" />
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Map Link</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr
                    key={b.id}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td style={tdStyle}>#{b.number}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{b.name}</td>
                    <td style={tdStyle}>{b.address || "—"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    >
                      {b.phone || "—"}
                    </td>
                    <td style={tdStyle}>
                      {b.map_link ? (
                        <a
                          href={b.map_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--color-rose)" }}
                        >
                          View Map ↗
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={outlineBtn} onClick={() => openEdit(b)}>
                          Edit
                        </button>
                        <button
                          style={{
                            ...outlineBtn,
                            color: "var(--color-danger)",
                            borderColor: "var(--color-danger)",
                          }}
                          onClick={() => deleteMutation.mutate(b.id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer rendered OUTSIDE the main div structure */}
      <BranchDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        editing={editingBranch}
      />
    </>
  );
}

/* ─── Staff Tab drawershell─── */
function StaffTab() {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const { data: staff = [], isLoading } = useQuery<Staff[]>({
    queryKey: QK.staff(),
    queryFn: fetchStaff,
    staleTime: 5 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/salon-admin/api/settings/staff/${id}`),
    onSuccess: () => {
      toast.success("Staff member removed");
      qc.invalidateQueries({ queryKey: QK.staff() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openAdd() {
    setEditingStaff(null);
    setDrawerOpen(true);
  }

  function openEdit(staff: Staff) {
    setEditingStaff(staff);
    setDrawerOpen(true);
  }

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ fontWeight: 600 }}>Staff Management</h4>
          <button style={primaryBtn} onClick={openAdd}>
            + Add Staff
          </button>
        </div>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "20px" }}>
              <Skeleton style={{ height: "44px" }} />
            </div>
          ) : staff.length === 0 ? (
            <EmptyState icon="👥" title="No staff yet" />
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  {["Name", "Phone", "Role", "Branch", "Status", "Actions"].map(
                    (h) => (
                      <th key={h} style={thStyle}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr
                    key={s.id}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{s.name}</td>
                    <td
                      style={{
                        ...tdStyle,
                        fontFamily: "monospace",
                        fontSize: "12px",
                      }}
                    >
                      {s.phone}
                    </td>
                    <td style={tdStyle}>
                      <Badge status="pending" label={s.role} />
                    </td>
                    <td style={tdStyle}>{s.branch_name ?? "—"}</td>
                    <td style={tdStyle}>
                      <Badge status={s.status} />
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button style={outlineBtn} onClick={() => openEdit(s)}>
                          Edit
                        </button>
                        <button
                          style={{
                            ...outlineBtn,
                            color: "var(--color-danger)",
                            borderColor: "var(--color-danger)",
                          }}
                          onClick={() => deleteMutation.mutate(s.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <StaffDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingStaff(null);
        }}
        editing={editingStaff}
      />
    </>
  );
}
/* ─── Staff Tab drawershell─── */

/* ─── Roles Tab ─── */
function RolesTab() {
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: QK.roles(),
    queryFn: fetchRoles,
    staleTime: 10 * 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/salon-admin/api/settings/roles/${id}`),
    onSuccess: () => {
      toast.success("Role deleted");
      qc.invalidateQueries({ queryKey: QK.roles() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ fontWeight: 600 }}>Staff Roles</h4>
          <button style={primaryBtn} onClick={() => setDrawerOpen(true)}>
            + Add Role
          </button>
        </div>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            maxWidth: "480px",
          }}
        >
          {isLoading ? (
            <div style={{ padding: "20px" }}>
              <Skeleton style={{ height: "44px" }} />
            </div>
          ) : roles.length === 0 ? (
            <EmptyState icon="🏷️" title="No roles yet" />
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  {["Role Name", "Actions"].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{r.name}</td>
                    <td style={tdStyle}>
                      <button
                        style={{
                          ...outlineBtn,
                          color: "var(--color-danger)",
                          borderColor: "var(--color-danger)",
                        }}
                        onClick={() => deleteMutation.mutate(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <RoleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

/* ─── Timings Tab ─── */
function TimingsTab() {
  const qc = useQueryClient();
  const { data: timings } = useQuery<SalonTimings>({
    queryKey: QK.timings(),
    queryFn: fetchTimings,
    staleTime: 10 * 60_000,
  });

  const [wdOpen, setWdOpen] = useState(timings?.workday?.open_time ?? "09:00");
  const [wdClose, setWdClose] = useState(
    timings?.workday?.close_time ?? "20:00"
  );
  const [weOpen, setWeOpen] = useState(timings?.weekend?.open_time ?? "10:00");
  const [weClose, setWeClose] = useState(
    timings?.weekend?.close_time ?? "20:00"
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put("/salon-admin/api/settings/timings", {
        workday: { open_time: wdOpen, close_time: wdClose },
        weekend: { open_time: weOpen, close_time: weClose },
      }),
    onSuccess: () => {
      toast.success("Hours saved");
      qc.invalidateQueries({ queryKey: QK.timings() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "24px",
        maxWidth: "480px",
      }}
    >
      <h4 style={{ fontWeight: 600, marginBottom: "20px" }}>
        🕐 Salon Operating Hours
      </h4>

      <div style={{ marginBottom: "20px" }}>
        <h5 style={{ fontWeight: 600, marginBottom: "12px" }}>
          🗓️ Workdays (Mon – Fri)
        </h5>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <TimeInput label="Opens At" value={wdOpen} onChange={setWdOpen} />
          <TimeInput label="Closes At" value={wdClose} onChange={setWdClose} />
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h5 style={{ fontWeight: 600, marginBottom: "12px" }}>
          🏖️ Weekends (Sat – Sun)
        </h5>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <TimeInput label="Opens At" value={weOpen} onChange={setWeOpen} />
          <TimeInput label="Closes At" value={weClose} onChange={setWeClose} />
        </div>
      </div>

      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        style={primaryBtn}
      >
        Save Hours
      </button>
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: "12px",
          fontWeight: 500,
          display: "block",
          marginBottom: "4px",
          color: "var(--color-sub)",
        }}
      >
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          fontSize: "13px",
          background: "var(--color-surface)",
        }}
      />
    </div>
  );
}

/* ─── Integrations Tab ─── */
function IntegrationsTab() {
  const qc = useQueryClient();
  const { data: config } = useQuery<WebhookConfig>({
    queryKey: QK.webhookConfig(),
    queryFn: fetchWebhookConfig,
    staleTime: 5 * 60_000,
  });

  const backendOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  const [wa, setWa] = useState({ phone_number_id: "", access_token: "", verify_token: "" });
  const [ig, setIg] = useState({ page_access_token: "", verify_token: "" });
  const [fb, setFb] = useState({ page_access_token: "", verify_token: "" });

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put("/salon-admin/api/webhook-config", {
        wa_phone_number_id: wa.phone_number_id || undefined,
        wa_access_token: wa.access_token || undefined,
        wa_verify_token: wa.verify_token || undefined,
        ig_page_access_token: ig.page_access_token || undefined,
        ig_verify_token: ig.verify_token || undefined,
        fb_page_access_token: fb.page_access_token || undefined,
        fb_verify_token: fb.verify_token || undefined,
      }),
    onSuccess: () => {
      toast.success("Integrations saved");
      setWa({ phone_number_id: "", access_token: "", verify_token: "" });
      setIg({ page_access_token: "", verify_token: "" });
      setFb({ page_access_token: "", verify_token: "" });
      qc.invalidateQueries({ queryKey: QK.webhookConfig() });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function StatusBadge({ connected }: { connected: boolean }) {
    return (
      <span style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: connected ? "#dcfce7" : "#f1f5f9",
        color: connected ? "#16a34a" : "#94a3b8",
      }}>
        {connected ? "Connected" : "Not connected"}
      </span>
    );
  }

  function WebhookUrlRow({ label, path }: { label: string; path?: string }) {
    const [copied, setCopied] = useState(false);
    const full = path ? `${backendOrigin}${path}` : "";
    if (!full) return null;
    return (
      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "11px", color: "var(--color-sub)", marginBottom: "3px" }}>{label}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fafc", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "7px 10px" }}>
          <code style={{ fontSize: "11px", color: "#6366f1", flex: 1, wordBreak: "break-all" }}>{full}</code>
          <button onClick={() => { navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ padding: "3px 8px", background: copied ? "#22c55e" : "#667eea", color: "#fff", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  function CredField({ label, value, onChange, placeholder, isPassword }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; isPassword?: boolean }) {
    return (
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", fontWeight: 500, display: "block", marginBottom: "4px", color: "var(--color-sub)" }}>{label}</label>
        <input
          type={isPassword ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "13px", background: "var(--color-surface)", boxSizing: "border-box" }}
        />
      </div>
    );
  }

  function PlatformCard({ icon, title, connected, webhookPath, children }: {
    icon: string; title: string; connected: boolean; webhookPath?: string; children: React.ReactNode;
  }) {
    return (
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "22px" }}>{icon}</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 600, margin: 0 }}>{title}</h4>
          </div>
          <StatusBadge connected={connected} />
        </div>
        {webhookPath && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "6px", color: "var(--color-text)" }}>Webhook URL — paste this into Meta Developer Console</p>
            <WebhookUrlRow label="Webhook endpoint" path={webhookPath} />
          </div>
        )}
        <p style={{ fontSize: "12px", color: "var(--color-sub)", marginBottom: "12px" }}>
          Leave fields blank to keep existing credentials.
        </p>
        {children}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px" }}>
      <p style={{ fontSize: "13px", color: "var(--color-sub)", marginBottom: "20px" }}>
        Connect your salon&apos;s WhatsApp, Instagram, and Facebook accounts so customers can book through messaging apps.
      </p>

      <PlatformCard icon="💬" title="WhatsApp" connected={!!config?.has_whatsapp} webhookPath={config?.webhook_urls?.whatsapp}>
        <CredField label="Phone Number ID" value={wa.phone_number_id} onChange={(v) => setWa((p) => ({ ...p, phone_number_id: v }))} placeholder="Enter Phone Number ID" />
        <CredField label="Access Token" value={wa.access_token} onChange={(v) => setWa((p) => ({ ...p, access_token: v }))} placeholder="Enter Access Token" isPassword />
        <CredField label="Verify Token (your custom string)" value={wa.verify_token} onChange={(v) => setWa((p) => ({ ...p, verify_token: v }))} placeholder="e.g. my-salon-verify-123" />
      </PlatformCard>

      <PlatformCard icon="📸" title="Instagram" connected={!!config?.has_instagram} webhookPath={config?.webhook_urls?.instagram}>
        <CredField label="Page Access Token" value={ig.page_access_token} onChange={(v) => setIg((p) => ({ ...p, page_access_token: v }))} placeholder="Enter Page Access Token" isPassword />
        <CredField label="Verify Token (your custom string)" value={ig.verify_token} onChange={(v) => setIg((p) => ({ ...p, verify_token: v }))} placeholder="e.g. my-salon-ig-verify" />
      </PlatformCard>

      <PlatformCard icon="👍" title="Facebook Messenger" connected={!!config?.has_facebook} webhookPath={config?.webhook_urls?.facebook}>
        <CredField label="Page Access Token" value={fb.page_access_token} onChange={(v) => setFb((p) => ({ ...p, page_access_token: v }))} placeholder="Enter Page Access Token" isPassword />
        <CredField label="Verify Token (your custom string)" value={fb.verify_token} onChange={(v) => setFb((p) => ({ ...p, verify_token: v }))} placeholder="e.g. my-salon-fb-verify" />
      </PlatformCard>

      <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} style={primaryBtn}>
        {saveMutation.isPending ? "Saving…" : "Save Integrations"}
      </button>
    </div>
  );
}

/* ─── Account Tab ─── */
function AccountTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.put("/salon-admin/api/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "420px" }}>
      <h3 style={{ fontWeight: 600, marginBottom: "4px" }}>Change Password</h3>
      <p style={{ fontSize: "13px", color: "var(--color-sub)", marginBottom: "20px" }}>
        Update your login password. You will need your current password to confirm.
      </p>
      <form onSubmit={handleSubmit}>
        {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
          <div key={field} style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, marginBottom: "4px", color: "var(--color-sub)" }}>
              {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
            </label>
            <input
              type="password"
              required
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              style={{ width: "100%", padding: "9px 12px", border: "1.5px solid var(--color-border)", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        ))}
        <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Saving…" : "Update Password"}
        </button>
      </form>
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
  padding: "5px 12px",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: 500,
  background: "transparent",
  cursor: "pointer",
  color: "var(--color-sub)",
};

const thStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--color-sub)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  background: "#fafafa",
  borderBottom: "1px solid var(--color-border)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
};
