import { featuredEvents } from "../../lib/site-data";

export default function EventsPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Schedule</span>
        <h1>Events</h1>
        <p>
          Club sessions are built around consistent formats, useful review, and
          clear registration capacity.
        </p>
      </section>
      <section className="band alt">
        <div className="container">
          <div className="card-grid">
            {featuredEvents.map((event) => (
              <article className="card" key={event.slug}>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="card-meta">
                  <span className="pill">{event.location}</span>
                  <span className="pill">{event.date}</span>
                  <span className="pill">{event.capacity}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
