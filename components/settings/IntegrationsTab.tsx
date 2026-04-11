// components/settings/IntegrationsTab.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWebhookConfig, fetchGeneral, QK } from "@/lib/queries";
import type { WebhookConfig } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";

interface IntegrationsTabProps {
  tenantId: string;
}

export function IntegrationsTab({ tenantId }: IntegrationsTabProps) {
  const qc = useQueryClient();
  const { data: config } = useQuery<WebhookConfig>({
    queryKey: QK.webhookConfig(),
    queryFn: fetchWebhookConfig,
    staleTime: 5 * 60_000,
  });

  const [wa, setWa] = useState({ 
    phone_number_id: "", 
    access_token: "", 
    verify_token: "" 
  });
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

  const backendOrigin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <p style={{ fontSize: "13px", color: "var(--color-sub)", marginBottom: "0" }}>
        Connect your salon&apos;s WhatsApp, Instagram, and Facebook accounts so customers can book through messaging apps.
      </p>

      {/* Two-column layout for better space utilization */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* LEFT COLUMN - WhatsApp */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              background: "#fafafa",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>💬</span>
              <h4 style={{ fontWeight: 600, margin: 0 }}>WhatsApp</h4>
            </div>
            <Badge 
              status={config?.has_whatsapp ? "active" : "inactive"} 
              label={config?.has_whatsapp ? "Connected" : "Not connected"} 
            />
          </div>
          
          <div style={{ padding: "20px" }}>
            {/* Webhook URL - Always visible with actual tenant ID */}
            <div
              style={{
                background: "var(--color-canvas)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "8px", color: "var(--color-sub)" }}>
                🔗 Webhook URL
              </label>
              <WebhookUrlDisplay 
                url={`${backendOrigin}/webhooks/${tenantId}/whatsapp`}
              />
              <p style={{ fontSize: "11px", color: "var(--color-sub)", marginTop: "8px" }}>
                Paste this URL in your Meta Developer Console webhook configuration.
              </p>
            </div>

            {/* Credentials */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <CredentialField
                label="Phone Number ID"
                value={wa.phone_number_id}
                onChange={(v) => setWa({ ...wa, phone_number_id: v })}
                placeholder="Enter Phone Number ID"
              />
              <CredentialField
                label="Access Token"
                value={wa.access_token}
                onChange={(v) => setWa({ ...wa, access_token: v })}
                placeholder="Enter Access Token"
                isPassword
              />
              <CredentialField
                label="Verify Token"
                value={wa.verify_token}
                onChange={(v) => setWa({ ...wa, verify_token: v })}
                placeholder="e.g., my-salon-verify-123"
                helpText="Your custom verification token - must match what you set in Meta Developer Console"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Instagram & Facebook */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Instagram Card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#fafafa",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📸</span>
                <h4 style={{ fontWeight: 600, margin: 0 }}>Instagram</h4>
              </div>
              <Badge 
                status={config?.has_instagram ? "active" : "inactive"} 
                label={config?.has_instagram ? "Connected" : "Not connected"} 
              />
            </div>
            
            <div style={{ padding: "20px" }}>
              {/* Webhook URL - Always visible with actual tenant ID */}
              <div
                style={{
                  background: "var(--color-canvas)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "8px", color: "var(--color-sub)" }}>
                  🔗 Webhook URL
                </label>
                <WebhookUrlDisplay 
                  url={`${backendOrigin}/webhooks/${tenantId}/instagram`}
                />
                <p style={{ fontSize: "11px", color: "var(--color-sub)", marginTop: "8px" }}>
                  Paste this URL in your Meta Developer Console webhook configuration.
                </p>
              </div>

              {/* Credentials */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <CredentialField
                  label="Page Access Token"
                  value={ig.page_access_token}
                  onChange={(v) => setIg({ ...ig, page_access_token: v })}
                  placeholder="Enter Page Access Token"
                  isPassword
                />
                <CredentialField
                  label="Verify Token"
                  value={ig.verify_token}
                  onChange={(v) => setIg({ ...ig, verify_token: v })}
                  placeholder="e.g., my-salon-ig-verify"
                  helpText="Your custom verification token - must match what you set in Meta Developer Console"
                />
              </div>
            </div>
          </div>

          {/* Facebook Card */}
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#fafafa",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>👍</span>
                <h4 style={{ fontWeight: 600, margin: 0 }}>Facebook Messenger</h4>
              </div>
              <Badge 
                status={config?.has_facebook ? "active" : "inactive"} 
                label={config?.has_facebook ? "Connected" : "Not connected"} 
              />
            </div>
            
            <div style={{ padding: "20px" }}>
              {/* Webhook URL - Always visible with actual tenant ID */}
              <div
                style={{
                  background: "var(--color-canvas)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  marginBottom: "20px",
                }}
              >
                <label style={{ fontSize: "12px", fontWeight: 600, display: "block", marginBottom: "8px", color: "var(--color-sub)" }}>
                  🔗 Webhook URL
                </label>
                <WebhookUrlDisplay 
                  url={`${backendOrigin}/webhooks/${tenantId}/facebook`}
                />
                <p style={{ fontSize: "11px", color: "var(--color-sub)", marginTop: "8px" }}>
                  Paste this URL in your Meta Developer Console webhook configuration.
                </p>
              </div>

              {/* Credentials */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <CredentialField
                  label="Page Access Token"
                  value={fb.page_access_token}
                  onChange={(v) => setFb({ ...fb, page_access_token: v })}
                  placeholder="Enter Page Access Token"
                  isPassword
                />
                <CredentialField
                  label="Verify Token"
                  value={fb.verify_token}
                  onChange={(v) => setFb({ ...fb, verify_token: v })}
                  placeholder="e.g., my-salon-fb-verify"
                  helpText="Your custom verification token - must match what you set in Meta Developer Console"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          style={primaryBtn}
        >
          {saveMutation.isPending ? "Saving…" : "Save All Integrations"}
        </button>
      </div>
    </div>
  );
}

// Sub-component: Webhook URL Display with Copy Button
function WebhookUrlDisplay({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copyUrl() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Webhook URL copied");
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "10px 12px",
      }}
    >
      <code
        style={{
          fontSize: "12px",
          color: "#3b82f6",  // Changed from "var(--color-rose)" to blue
          wordBreak: "break-all",
          flex: 1,
          fontFamily: "monospace",
        }}
      >
        {url}
      </code>
      <button
        onClick={copyUrl}
        style={{
          padding: "4px 12px",
          background: copied ? "#16a34a" : "var(--color-rose)",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

// Sub-component: Credential Field
function CredentialField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  isPassword,
  helpText
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  isPassword?: boolean;
  helpText?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: "13px", fontWeight: 500, display: "block", marginBottom: "6px", color: "var(--color-ink)" }}>
        {label}
      </label>
      <input
        type={isPassword ? "password" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "10px 14px",
          border: "1.5px solid var(--color-border)",
          borderRadius: "8px",
          fontSize: "14px",
          background: "var(--color-surface)",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => e.target.style.borderColor = "var(--color-rose)"}
        onBlur={(e) => e.target.style.borderColor = "var(--color-border)"}
      />
      {helpText && (
        <p style={{ fontSize: "11px", color: "var(--color-sub)", marginTop: "4px" }}>
          {helpText}
        </p>
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