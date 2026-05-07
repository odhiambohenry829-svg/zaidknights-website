export default function ProfilePage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Member profile</span>
        <h1>Profile</h1>
        <p>
          Member profiles track photo, ratings, achievements, match history,
          attendance percentage, training group, and junior safety notes.
        </p>
      </section>
      <section className="band alt">
        <div className="container">
          <div className="card-grid">
            <article className="card">
              <div>
                <h3>Ratings</h3>
                <p>ELO and internal rating history are stored with source, event, and change tracking.</p>
              </div>
              <span className="pill">ChessRatingHistory</span>
            </article>
            <article className="card">
              <div>
                <h3>Attendance</h3>
                <p>Each event can record attendance status, notes, check-in time, and recorder.</p>
              </div>
              <span className="pill">Attendance</span>
            </article>
            <article className="card">
              <div>
                <h3>Safety</h3>
                <p>Junior profiles include medical notes, guardians, and emergency contact details.</p>
              </div>
              <span className="pill">Member safety fields</span>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
