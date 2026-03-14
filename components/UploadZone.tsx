"use client";

import { useRef, useState, useCallback } from "react";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  onUrl: (url: string) => void;
  loading: boolean;
}

export default function UploadZone({ onUpload, onUrl, loading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (!loading) setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (loading) return;
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) return;
    onUpload(file);
  };

  const handleZoneClick = () => {
    if (loading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || loading) return;
    onUrl(trimmed);
    setUrl("");
  };

  const dropZoneStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "240px",
    border: `1.5px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
    borderRadius: "12px",
    background: isDragging
      ? "rgba(99, 102, 241, 0.05)"
      : loading
      ? "var(--surface-2)"
      : "var(--surface)",
    cursor: loading ? "default" : "pointer",
    transition: "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
    boxShadow: isDragging
      ? "0 0 0 2px var(--accent), 0 0 36px rgba(99, 102, 241, 0.15)"
      : "none",
    opacity: loading ? 0.75 : 1,
    userSelect: "none",
    gap: "12px",
    padding: "40px 24px",
    position: "relative",
    overflow: "hidden",
  };

  const iconWrapStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: isDragging ? "rgba(99, 102, 241, 0.15)" : "var(--surface-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
    transition: "background 0.15s ease",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Drop zone */}
      <div
        style={dropZoneStyle}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={loading ? -1 : 0}
        aria-label="Upload PDF by drag and drop or click to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleZoneClick();
        }}
      >
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Processing document...
            </p>
          </div>
        ) : (
          <>
            <div style={iconWrapStyle}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDragging ? "var(--accent)" : "var(--text-secondary)"}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: "stroke 0.15s ease" }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>

            <div style={{ textAlign: "center", lineHeight: 1.5 }}>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: isDragging ? "var(--accent)" : "var(--text-primary)",
                  transition: "color 0.15s ease",
                  marginBottom: "4px",
                }}
              >
                Drag &amp; drop a PDF
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                or click to browse &mdash; up to 20 MB
              </p>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={loading}
          tabIndex={-1}
        />
      </div>

      {/* URL input row */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 500,
            flexShrink: 0,
          }}>
            or paste a URL
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>
        <form
          onSubmit={handleUrlSubmit}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/paper.pdf"
            disabled={loading}
            style={{
              flex: 1,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "9px 13px",
              fontSize: "13px",
              color: "var(--text-primary)",
              outline: "none",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "text",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(99, 102, 241, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            style={{
              background: loading || !url.trim() ? "var(--surface-2)" : "var(--accent)",
              color: loading || !url.trim() ? "var(--text-muted)" : "#fff",
              border: "1px solid",
              borderColor: loading || !url.trim() ? "var(--border)" : "var(--accent)",
              borderRadius: "8px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: loading || !url.trim() ? "not-allowed" : "pointer",
              transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              if (!loading && url.trim()) {
                e.currentTarget.style.background = "var(--accent-hover)";
                e.currentTarget.style.borderColor = "var(--accent-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && url.trim()) {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }
            }}
          >
            {loading ? (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Loading
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
