export default function OrganizationsPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Schools and partners</span>
        <h1>Organizations</h1>
        <p>
          Register a school, company, academy, or external club for training
          partnerships, tournament entry, or membership affiliation.
        </p>
      </section>

      <section className="band alt">
        <div className="container contact-layout">
          <div>
            <div className="section-head">
              <h2>Partnership Flow</h2>
              <p>
                Applications are approval-based. Once approved, organizations can
                manage teams, bulk member lists, billing, and training schedules.
              </p>
            </div>
            <div className="contact-list">
              <div>
                <strong>Schools</strong>
                <p>Junior training groups, safeguarding notes, and term planning.</p>
              </div>
              <div>
                <strong>Companies</strong>
                <p>Workplace chess programs, tournaments, and employee teams.</p>
              </div>
              <div>
                <strong>Academies and clubs</strong>
                <p>Affiliate registration, tournament teams, and competition history.</p>
              </div>
            </div>
          </div>

          <div className="contact-panel">
            <form className="form" action="/api/organizations" method="post">
              <div className="form-grid">
                <label>
                  Organization name
                  <input name="name" required minLength={2} />
                </label>
                <label>
                  Type
                  <select name="type" defaultValue="SCHOOL">
                    <option value="SCHOOL">School</option>
                    <option value="COMPANY">Company</option>
                    <option value="ACADEMY">Academy</option>
                    <option value="CLUB">Chess club</option>
                  </select>
                </label>
                <label>
                  Registration number
                  <input name="registrationNumber" />
                </label>
                <label>
                  County
                  <input name="county" />
                </label>
                <label>
                  City
                  <input name="city" required />
                </label>
                <label>
                  Members/students
                  <input name="memberCount" type="number" min="0" defaultValue="0" />
                </label>
                <label>
                  Contact person
                  <input name="contactPersonName" required />
                </label>
                <label>
                  Contact role
                  <input name="contactPersonRole" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" required />
                </label>
                <label>
                  Phone
                  <input name="phone" required />
                </label>
                <label>
                  Chess interest
                  <select name="interestLevel" defaultValue="BEGINNER">
                    <option value="BEGINNER">Beginner</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPETITIVE">Competitive</option>
                  </select>
                </label>
                <label>
                  Participation
                  <select name="participationType" defaultValue="TRAINING_PARTNERSHIP">
                    <option value="TRAINING_PARTNERSHIP">Training partnership</option>
                    <option value="TOURNAMENT_ENTRY">Tournament entry</option>
                    <option value="MEMBERSHIP_AFFILIATION">Membership affiliation</option>
                  </select>
                </label>
                <label className="full">
                  Preferred training schedule
                  <input name="preferredTrainingSchedule" />
                </label>
                <label className="full">
                  Competition participation history
                  <textarea name="competitionHistory" />
                </label>
              </div>
              <button className="button" type="submit">
                Submit registration
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
