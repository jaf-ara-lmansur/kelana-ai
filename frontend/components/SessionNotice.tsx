"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NoticeType = "expired" | "logout";

type SessionEventDetail = {
  type: NoticeType;
};

function getTokenExpiry(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function SessionNotice() {
  const [notice, setNotice] = useState<NoticeType | null>(null);

  useEffect(() => {
    let expiryTimer: number | undefined;

    const showNotice = (event: Event) => {
      const detail = (event as CustomEvent<SessionEventDetail>).detail;
      if (detail?.type) setNotice(detail.type);
    };

    const scheduleExpiryNotice = () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const expiry = getTokenExpiry(token);
      if (!expiry) return;

      const delay = expiry - Date.now();
      if (delay <= 0) {
        window.setTimeout(() => setNotice("expired"), 0);
        return;
      }

      expiryTimer = window.setTimeout(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        setNotice("expired");
      }, delay);
    };

    window.addEventListener("kelana:session-notice", showNotice);
    window.addEventListener("storage", scheduleExpiryNotice);
    scheduleExpiryNotice();

    return () => {
      window.removeEventListener("kelana:session-notice", showNotice);
      window.removeEventListener("storage", scheduleExpiryNotice);
      if (expiryTimer) window.clearTimeout(expiryTimer);
    };
  }, []);

  if (!notice) return null;

  const isExpired = notice === "expired";

  return (
    <div className="session-notice-overlay" role="presentation">
      <section
        aria-labelledby="session-notice-title"
        aria-modal="true"
        className="session-notice"
        role="alertdialog"
      >
        <span className={`session-notice-icon ${isExpired ? "expired" : "logged-out"}`} aria-hidden="true">
          {isExpired ? "!" : "✓"}
        </span>
        <h2 id="session-notice-title">
          {isExpired ? "Sesi login telah habis" : "Logout berhasil"}
        </h2>
        <p>
          {isExpired
            ? "Waktu sesi login kamu telah habis. Silakan login ulang untuk melanjutkan."
            : "Kamu telah berhasil keluar dari akun Kelana AI."}
        </p>
        {isExpired && (
          <Link className="session-notice-login" href="/login">
            Login ulang
          </Link>
        )}
        <button
          aria-label="Tutup pesan sesi"
          className="session-notice-close"
          onClick={() => setNotice(null)}
          type="button"
        >
          Tutup
        </button>
      </section>
    </div>
  );
}
