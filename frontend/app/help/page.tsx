import Link from "next/dist/client/link";

export default function HelpPage() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <header className="auth-header">
            <p>Kelana AI</p>
            <h1>Help Center</h1>
          </header>
          <p className="hero-text" style={{ marginTop: 0, maxWidth: "100%" }}>
            Butuh bantuan? Kamu bisa menghubungi support kami atau melihat panduan
            perjalanan di halaman ini.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
            <Link className="primary-button" href="/">
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}