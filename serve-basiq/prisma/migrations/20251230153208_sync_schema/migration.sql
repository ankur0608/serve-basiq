/*
  Warnings:

  - You are about to drop the column `social` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `cat` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `reviews` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `social` on the `Service` table. All the data in the column will be lost.
  - Added the required column `line2` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Service_userId_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "line2" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "social",
DROP COLUMN "supplier",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "cat",
DROP COLUMN "reviews",
DROP COLUMN "social",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "altPhone" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "closeTime" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30),
ADD COLUMN     "openTime" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "radiusKm" INTEGER DEFAULT 10,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "subCategoryIds" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workingDays" TEXT[],
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "loc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountHolder" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankIfsc" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "businessProofImg" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "idProofImg" TEXT,
ADD COLUMN     "idProofNumber" TEXT,
ADD COLUMN     "idProofType" TEXT DEFAULT 'Aadhaar',
ADD COLUMN     "image" TEXT,
ADD COLUMN     "img" TEXT,
ADD COLUMN     "isWebsite" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "upiId" TEXT,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "serviceId" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
