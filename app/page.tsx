import Link from "next/link";
import {
  featuredEvents,
  galleryItems,
  latestPosts,
  membershipLevels,
  siteStats,
} from "../lib/site-data";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Chess club and academy</span>
          <h1>Zaid Knights</h1>
          <p className="lead">
            A focused chess home for players who want disciplined coaching,
            regular competition, and a strong club community around the board.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/events">
              View events
            </Link>
            <Link className="button secondary" href="/contact">
              Join the club
            </Link>
          </div>
        </div>
        <div className="hero-media">
          <img
            alt="Chess pieces set for a competitive game"
            src="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1600&q=85"
          />
          <div className="hero-note">
            <strong>Next club night</strong>
            <span>Rapid games, pairings, coaching review, and member standings.</span>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="stats-grid">
            {siteStats.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="container">
          <div className="section-head">
            <h2>Upcoming Club Play</h2>
            <p>
              Events are structured for repeatable progress: clear formats,
              predictable schedules, and games that players can review afterward.
            </p>
          </div>
          <div className="card-grid">
            {featuredEvents.map((event) => (
              <article className="card" key={event.slug}>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="card-meta">
                  <span className="pill">{event.date}</span>
                  <span className="pill">{event.capacity}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="section-head">
            <h2>Member Pathway</h2>
            <p>
              Players move through clear levels with coaching attention, rated
              games, and review habits that make progress visible.
            </p>
          </div>
          <div className="level-grid">
            {membershipLevels.map((level) => (
              <article className="level" key={level.title}>
                <h3>{level.title}</h3>
                <p>{level.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="container">
          <div className="section-head">
            <h2>Club Management</h2>
            <p>
              Funding, renewals, organizations, attendance, ratings, and admin
              tracking are built into the system behind the public site.
            </p>
          </div>
          <div className="card-grid">
            <article className="card">
              <div>
                <h3>Donations</h3>
                <p>One-time and monthly supporter donations with categories, campaigns, receipts, and leaderboard support.</p>
              </div>
              <Link className="button secondary" href="/donate">
                Donate
              </Link>
            </article>
            <article className="card">
              <div>
                <h3>Renewals</h3>
                <p>Monthly, term, and annual memberships with expiry, grace period, reminders, and payment history.</p>
              </div>
              <Link className="button secondary" href="/renew">
                Renew
              </Link>
            </article>
            <article className="card">
              <div>
                <h3>Organizations</h3>
                <p>Schools, companies, academies, and clubs can register for approval-based onboarding.</p>
              </div>
              <Link className="button secondary" href="/organizations">
                Register
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="section-head">
            <h2>News And Study Notes</h2>
            <p>
              Coaches and administrators can publish updates, tournament notes,
              and practical study material for members.
            </p>
          </div>
          <div className="card-grid">
            {latestPosts.map((post) => (
              <article className="card" key={post.slug}>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <Link className="button secondary" href="/news">
                  Read news
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container">
          <div className="section-head">
            <h2>Club Gallery</h2>
            <p>
              A visual record of tournaments, classes, and the weekly habits that
              turn casual games into steady improvement.
            </p>
          </div>
          <div className="gallery-grid">
            {galleryItems.map((item) => (
              <article className="gallery-item" key={item.title}>
                <img alt={item.title} src={item.imageUrl} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
