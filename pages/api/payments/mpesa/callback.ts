import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { parseMpesaCallback, type MpesaCallbackBody } from '../../../../lib/mpesa';
import { sendDonationReceipt, sendMembershipReceipt } from '../../../../lib/email';

// Disable body parsing to receive raw MPESA payload
export const config = { api: { bodyParser: true } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Always acknowledge MPESA immediately
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  try {
    const result = parseMpesaCallback(req.body as MpesaCallbackBody);

    if (!result.success) {
      await prisma.paymentTransaction.updateMany({
        where:  { checkoutRequestId: result.checkoutRequestId },
        data:   { status: 'FAILED', failureReason: result.reason },
      });
      return;
    }

    const tx = await prisma.paymentTransaction.findFirst({
      where: { checkoutRequestId: result.checkoutRequestId },
    });
    if (!tx) return;

    // Mark transaction as completed
    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status:         'COMPLETED',
        mpesaReceiptNo: result.mpesaReceiptNo,
        mpesaCode:      result.mpesaReceiptNo,
      },
    });

    // Fulfill donation
    if (tx.donationId) {
      const donation = await prisma.donation.update({
        where: { id: tx.donationId },
        data:  { status: 'COMPLETED' },
      });

      // Send receipt email
      try {
        await sendDonationReceipt(donation.donorEmail, {
          donorName:  donation.donorName,
          amount:     donation.amount,
          category:   donation.category,
          mpesaCode:  result.mpesaReceiptNo,
          date:       new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
          message:    donation.message ?? undefined,
        });
      } catch (emailErr) {
        console.error('Donation receipt email failed:', emailErr);
      }
    }

    // Fulfill membership
    if (tx.membershipId) {
      const membership = await prisma.membership.update({
        where: { id: tx.membershipId },
        data:  { status: 'ACTIVE' },
        include: { member: { include: { user: true } } },
      });

      // Activate member status
      await prisma.member.update({
        where: { id: membership.memberId },
        data:  { status: 'ACTIVE' },
      });

      // Send receipt email
      try {
        const user = membership.member.user;
        await sendMembershipReceipt(user.email, {
          memberName: user.name ?? 'Member',
          plan:       membership.plan,
          tier:       membership.tier,
          amount:     membership.amount,
          startDate:  membership.startDate.toLocaleDateString('en-KE'),
          endDate:    membership.endDate.toLocaleDateString('en-KE'),
          mpesaCode:  result.mpesaReceiptNo,
        });
      } catch (emailErr) {
        console.error('Membership receipt email failed:', emailErr);
      }
    }
  } catch (err) {
    console.error('MPESA callback processing error:', err);
  }
}
