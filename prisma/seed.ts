import {
  DonationCategory,
  MemberStatus,
  MembershipLevel,
  MembershipTier,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  RegistrationStatus,
  Role,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@zaidknights.local" },
    update: {},
    create: {
      name: "Zaid Knights Admin",
      email: "admin@zaidknights.local",
      password: "replace-this-password-hash",
      role: Role.ADMIN,
    },
  });

  const member = await prisma.member.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      status: MemberStatus.ACTIVE,
      level: MembershipLevel.MASTER,
      rating: 1800,
      internalRating: 1800,
    },
  });

  const group = await prisma.trainingGroup.upsert({
    where: { id: "seed-competitive-squad" },
    update: {},
    create: {
      id: "seed-competitive-squad",
      name: "Competitive Squad",
      description: "Advanced training group for tournament preparation.",
      schedule: "Wednesday evenings",
      coachId: admin.id,
    },
  });

  await prisma.member.update({
    where: { id: member.id },
    data: { trainingGroupId: group.id },
  });

  const membership = await prisma.membership.upsert({
    where: { id: "seed-admin-membership" },
    update: {},
    create: {
      id: "seed-admin-membership",
      memberId: member.id,
      tier: MembershipTier.COMPETITIVE_SQUAD,
      status: "ACTIVE",
      plan: SubscriptionPlan.ANNUAL,
      expiresAt: new Date("2027-05-07T00:00:00.000Z"),
      gracePeriodEndsAt: new Date("2027-05-14T00:00:00.000Z"),
      autoRenew: false,
      trainingGroupId: group.id,
    },
  });

  const subscription = await prisma.subscription.upsert({
    where: { id: "seed-admin-subscription" },
    update: {},
    create: {
      id: "seed-admin-subscription",
      userId: admin.id,
      memberId: member.id,
      membershipId: membership.id,
      plan: SubscriptionPlan.ANNUAL,
      tier: MembershipTier.COMPETITIVE_SQUAD,
      status: SubscriptionStatus.ACTIVE,
      amount: "12000",
      endDate: new Date("2027-05-07T00:00:00.000Z"),
    },
  });

  const rapid = await prisma.event.upsert({
    where: { slug: "friday-rapid-arena" },
    update: {},
    create: {
      title: "Friday Rapid Arena",
      slug: "friday-rapid-arena",
      description:
        "Six rounds of rapid chess with live pairings and post-game review.",
      location: "Zaid Knights Club Hall",
      startDate: new Date("2026-05-08T16:00:00.000Z"),
      endDate: new Date("2026-05-08T19:00:00.000Z"),
      capacity: 32,
    },
  });

  await prisma.registration.upsert({
    where: {
      userId_eventId: {
        userId: admin.id,
        eventId: rapid.id,
      },
    },
    update: { status: RegistrationStatus.CONFIRMED },
    create: {
      userId: admin.id,
      eventId: rapid.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  await prisma.paymentTransaction.upsert({
    where: { id: "seed-admin-membership-payment" },
    update: {},
    create: {
      id: "seed-admin-membership-payment",
      userId: admin.id,
      memberId: member.id,
      membershipId: membership.id,
      subscriptionId: subscription.id,
      amount: "12000",
      method: PaymentMethod.MPESA,
      status: PaymentStatus.PAID,
      description: "Seed annual membership",
      paidAt: new Date(),
    },
  });

  const campaign = await prisma.donationCampaign.upsert({
    where: { slug: "training-equipment-drive" },
    update: {},
    create: {
      title: "Training Equipment Drive",
      slug: "training-equipment-drive",
      description: "Boards, clocks, notation books, and coaching tools.",
      category: DonationCategory.TRAINING_EQUIPMENT,
      goalAmount: "50000",
    },
  });

  const donation = await prisma.donation.upsert({
    where: { receiptNumber: "ZK-SEED-0001" },
    update: {},
    create: {
      donorUserId: admin.id,
      donorName: "Zaid Knights Admin",
      donorEmail: "admin@zaidknights.local",
      donorType: "ALUMNI",
      category: DonationCategory.TRAINING_EQUIPMENT,
      campaignId: campaign.id,
      amount: "5000",
      paymentMethod: PaymentMethod.MPESA,
      status: PaymentStatus.PAID,
      message: "Starter contribution for club equipment.",
      receiptNumber: "ZK-SEED-0001",
    },
  });

  await prisma.paymentTransaction.upsert({
    where: { id: "seed-admin-donation-payment" },
    update: {},
    create: {
      id: "seed-admin-donation-payment",
      userId: admin.id,
      donationId: donation.id,
      amount: "5000",
      method: PaymentMethod.MPESA,
      status: PaymentStatus.PAID,
      description: "Seed equipment donation",
      paidAt: new Date(),
    },
  });

  await prisma.post.upsert({
    where: { slug: "welcome-to-zaid-knights" },
    update: {},
    create: {
      title: "Welcome To Zaid Knights",
      slug: "welcome-to-zaid-knights",
      excerpt:
        "Our club platform is ready for events, members, results, news, and messages.",
      content:
        "Zaid Knights brings coaching, tournament discipline, and club community into one website.",
      authorId: admin.id,
      published: true,
    },
  });

  await prisma.galleryItem.createMany({
    data: [
      {
        id: "seed-gallery-tournament-boards",
        title: "Tournament Boards",
        imageUrl:
          "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=900&q=80",
        caption: "Rapid pairings during a club night.",
      },
      {
        id: "seed-gallery-training-session",
        title: "Training Session",
        imageUrl:
          "https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&w=900&q=80",
        caption: "Coaches reviewing candidate moves.",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
