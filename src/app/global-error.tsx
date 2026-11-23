"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f0e6", color: "#1f1d1a", fontFamily: "Georgia, serif", textAlign: "center", padding: "2rem" }}>
        <div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>Commonplace</p>
          <h1 style={{ fontSize: "2rem", margin: "1rem 0" }}>The ledger could not open.</h1>
          <p style={{ maxWidth: "28rem", lineHeight: 1.6 }}>Something went wrong while starting the app. Try again.</p>
          <button type="button" onClick={reset} style={{ marginTop: "1.5rem", padding: "0.7rem 1.2rem", border: "1px solid #1f1d1a", background: "#1f1d1a", color: "#f4f0e6", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
