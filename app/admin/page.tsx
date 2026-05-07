import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboard() {
  const [
    totalMembers,
    activeSubscriptions,
    donationSummary,
    organizationsRegistered,
    revenueSummary,
    recentPayments,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.donation.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.organization.count(),
    prisma.paymentTransaction.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true } },
        donation: { select: { category: true, anonymous: true, donorName: true } },
        subscription: { select: { plan: true, tier: true } },
      },
    }),
  ]);

  return {
    totalMembers,
    activeSubscriptions,
    donationsTotal: Number(donationSummary._sum.amount || 0),
    donationCount: donationSummary._count,
    organizationsRegistered,
    revenueTotal: Number(revenueSummary._sum.amount || 0),
    paymentCount: revenueSummary._count,
    recentPayments,
  };
}

export default async function AdminPage() {
  let dashboard;
  let error = false;

  try {
    dashboard = await getDashboard();
  } catch {
    error = true;
  }

  return (
    <main>
      <section className="page-title">
        <span className="eyebrow">Admin</span>
        <h1>Dashboard</h1>
        <p>
          Member growth, subscriptions, donations, organizations, and revenue
          tracking for club administrators.
        </p>
      </section>

      <section className="band alt">
        <div className="container">
          {error || !dashboard ? (
            <p className="notice">
              Connect the database and run Prisma migrations to activate live
              dashboard metrics.
            </p>
          ) : (
            <>
              <div className="dashboard-grid">
                <div className="stat">
                  <strong>{dashboard.totalMembers}</strong>
                  <span>Total members</span>
                </div>
                <div className="stat">
                  <strong>{dashboard.activeSubscriptions}</strong>
                  <span>Active subscriptions</span>
                </div>
                <div className="stat">
                  <strong>{dashboard.organizationsRegistered}</strong>
                  <span>Organizations registered</span>
                </div>
                <div className="stat">
                  <strong>KES {dashboard.revenueTotal.toLocaleString()}</strong>
                  <span>Revenue tracked</span>
                </div>
              </div>

              <div className="section-head" style={{ marginTop: 40 }}>
                <h2>Recent Payments</h2>
                <p>
                  Payment history joins donations, renewals, organization billing,
                  and membership subscriptions.
                </p>
              </div>

              <div className="table-list">
                {dashboard.recentPayments.map((payment) => (
                  <div className="table-row" key={payment.id}>
                    <div>
                      <strong>
                        {payment.donation?.anonymous
                          ? "Anonymous donor"
                          : payment.donation?.donorName || payment.user?.name || "Club payment"}
                      </strong>
                      <p>
                        {payment.method} · {payment.status} · {payment.currency}
                      </p>
                    </div>
                    <strong>KES {Number(payment.amount).toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
