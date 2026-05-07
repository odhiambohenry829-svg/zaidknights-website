import { latestPosts } from "../../lib/site-data";

export default function NewsPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Club notes</span>
        <h1>News</h1>
        <p>
          Updates from coaches and organizers, plus practical study notes for
          members preparing for stronger play.
        </p>
      </section>
      <section className="band alt">
        <div className="container">
          <div className="card-grid">
            {latestPosts.map((post) => (
              <article className="card" key={post.slug}>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <span className="pill">Published note</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
