-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "resetPasswordTokenExpiry" TIMESTAMP(3);
