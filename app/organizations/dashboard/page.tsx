export default function OrganizationDashboardPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Organization dashboard</span>
        <h1>Partner Dashboard</h1>
        <p>
          Approved organizations can manage teams, members, billing, schedules,
          bulk uploads, and competition history through the organization APIs.
        </p>
      </section>
      <section className="band alt">
        <div className="container">
          <div className="card-grid">
            <article className="card">
              <div>
                <h3>Teams and groups</h3>
                <p>Create training groups, assign coaches, and place students or members.</p>
              </div>
              <span className="pill">TrainingGroup</span>
            </article>
            <article className="card">
              <div>
                <h3>Bulk uploads</h3>
                <p>Track CSV upload status, row counts, success rows, and error reports.</p>
              </div>
              <span className="pill">BulkUpload</span>
            </article>
            <article className="card">
              <div>
                <h3>Billing</h3>
                <p>Organization payments connect to the shared payment transaction ledger.</p>
              </div>
              <span className="pill">PaymentTransaction</span>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
