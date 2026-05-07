export default function DonatePage() {
  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Club funding</span>
        <h1>Donate</h1>
        <p>
          Support equipment, tournaments, travel assistance, and the general club
          fund with one-time or monthly donations.
        </p>
      </section>

      <section className="band alt">
        <div className="container contact-layout">
          <div>
            <div className="section-head">
              <h2>Funding Priorities</h2>
              <p>
                Donations can be tied to a specific campaign or kept flexible for
                the club committee to allocate where the need is strongest.
              </p>
            </div>
            <div className="contact-list">
              <div>
                <strong>Training equipment</strong>
                <p>Boards, clocks, notation books, demo boards, and coaching aids.</p>
              </div>
              <div>
                <strong>Tournaments and travel</strong>
                <p>Entry fees, venue costs, transport, and player support.</p>
              </div>
              <div>
                <strong>Receipts and visibility</strong>
                <p>Donors can request receipts, donate anonymously, or appear on the leaderboard.</p>
              </div>
            </div>
          </div>

          <div className="contact-panel">
            <form className="form" action="/api/donations" method="post">
              <div className="form-grid">
                <label>
                  Donor name
                  <input name="donorName" minLength={2} />
                </label>
                <label>
                  Email
                  <input name="donorEmail" type="email" />
                </label>
                <label>
                  Amount
                  <input name="amount" type="number" min="1" step="1" required />
                </label>
                <label>
                  Donor type
                  <select name="donorType" defaultValue="INDIVIDUAL">
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="COMPANY">Company</option>
                    <option value="ALUMNI">Alumni</option>
                  </select>
                </label>
                <label>
                  Category
                  <select name="category" defaultValue="GENERAL_FUND">
                    <option value="TRAINING_EQUIPMENT">Training equipment</option>
                    <option value="TOURNAMENTS">Tournaments</option>
                    <option value="TRAVEL_SUPPORT">Travel support</option>
                    <option value="GENERAL_FUND">General fund</option>
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
                  Giving
                  <select name="frequency" defaultValue="ONE_TIME">
                    <option value="ONE_TIME">One-time</option>
                    <option value="MONTHLY">Monthly supporter</option>
                  </select>
                </label>
                <label>
                  Campaign slug
                  <input name="campaignSlug" placeholder="optional" />
                </label>
                <label className="full">
                  Message or dedication
                  <textarea name="message" />
                </label>
              </div>
              <label className="checkbox-row">
                <input name="anonymous" type="checkbox" value="true" />
                Donate anonymously
              </label>
              <label className="checkbox-row">
                <input name="taxReceiptRequested" type="checkbox" value="true" />
                Request organization tax receipt
              </label>
              <button className="button" type="submit">
                Record donation
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
