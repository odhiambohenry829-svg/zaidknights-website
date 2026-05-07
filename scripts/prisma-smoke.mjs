import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$connect();

  const [users, members, events, posts, donations, organizations, subscriptions] =
    await Promise.all([
    prisma.user.count(),
    prisma.member.count(),
    prisma.event.count(),
    prisma.post.count(),
    prisma.donation.count(),
    prisma.organization.count(),
    prisma.subscription.count(),
  ]);

  console.log("Prisma connected successfully.");
  console.log(`Users: ${users}`);
  console.log(`Members: ${members}`);
  console.log(`Events: ${events}`);
  console.log(`Posts: ${posts}`);
  console.log(`Donations: ${donations}`);
  console.log(`Organizations: ${organizations}`);
  console.log(`Subscriptions: ${subscriptions}`);
} finally {
  await prisma.$disconnect();
}
