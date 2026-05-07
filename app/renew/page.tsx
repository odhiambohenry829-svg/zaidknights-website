export default function RenewPage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Membership</span>
        <h1>Renew</h1>
        <p>
          Renew monthly, by school term, or annually. Renewals track expiry,
          grace periods, auto-renew preference, and payment history.
        </p>
      </section>

      <section className="band alt">
        <div className="container contact-layout">
          <div>
            <div className="section-head">
              <h2>Plan Options</h2>
              <p>
                Choose a tier and plan that matches the player pathway. Family
                accounts can keep juniors and guardians linked for safer club
                administration.
              </p>
            </div>
            <div className="level-grid">
              <article className="level">
                <h3>Monthly</h3>
                <p>Flexible recurring membership for active club players.</p>
              </article>
              <article className="level">
                <h3>Term</h3>
                <p>School-term membership for junior training cycles.</p>
              </article>
              <article className="level">
                <h3>Annual</h3>
                <p>Full-year membership with renewal reminders and grace period.</p>
              </article>
            </div>
          </div>

          <div className="contact-panel">
            <form className="form" action="/api/renewals" method="post">
              <div className="form-grid">
                <label>
                  Member ID
                  <input name="memberId" required />
                </label>
                <label>
                  Amount
                  <input name="amount" type="number" min="1" step="1" required />
                </label>
                <label>
                  Plan
                  <select name="plan" defaultValue="MONTHLY">
                    <option value="MONTHLY">Monthly</option>
                    <option value="TERM">Term-based</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </label>
                <label>
                  Tier
                  <select name="tier" defaultValue="BEGINNER">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="COMPETITIVE_SQUAD">Competitive squad</option>
                    <option value="FAMILY">Family</option>
                  </select>
                </label>
                <label>
                  Payment method
                  <select name="paymentMethod" defaultValue="MPESA">
                    <option value="MPESA">MPESA</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                  </select>
                </label>
                <label>
                  Training group ID
                  <input name="trainingGroupId" placeholder="optional" />
                </label>
              </div>
              <label className="checkbox-row">
                <input name="autoRenew" type="checkbox" value="true" />
                Enable auto-renew
              </label>
              <button className="button" type="submit">
                Renew membership
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
