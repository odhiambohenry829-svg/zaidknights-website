export default function ContactPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Membership</span>
        <h1>Contact</h1>
        <p>
          Send a membership, coaching, or event question to the club team and we
          will help you find the right next session.
        </p>
      </section>
      <section className="band alt">
        <div className="container contact-layout">
          <div>
            <div className="section-head">
              <h2>Visit The Club</h2>
              <p>
                Zaid Knights runs structured sessions for juniors, developing
                members, and tournament players.
              </p>
            </div>
            <div className="contact-list">
              <div>
                <strong>Training</strong>
                <p>Junior classes, member reviews, tactics, and endgame work.</p>
              </div>
              <div>
                <strong>Competition</strong>
                <p>Rapid arenas, league nights, standings, and event results.</p>
              </div>
              <div>
                <strong>Membership</strong>
                <p>Beginner, advanced, and master-level pathways.</p>
              </div>
            </div>
          </div>

          <div className="contact-panel">
            <form className="form" action="/api/contact" method="post">
              <label>
                Name
                <input name="name" required minLength={2} />
              </label>
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Message
                <textarea name="message" required minLength={10} />
              </label>
              <button className="button" type="submit">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
