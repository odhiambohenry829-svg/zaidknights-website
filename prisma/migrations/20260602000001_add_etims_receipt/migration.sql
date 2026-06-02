-- Add eTIMS receipt fields to PaymentTransaction
ALTER TABLE "PaymentTransaction" ADD COLUMN "etimsReceiptNo" TEXT;
ALTER TABLE "PaymentTransaction" ADD COLUMN "etimsData" TEXT;
