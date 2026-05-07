import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Not found</span>
        <h1>Page Missing</h1>
        <p>The page you are looking for is not available on the club site.</p>
        <div className="hero-actions">
          <Link className="button" href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
