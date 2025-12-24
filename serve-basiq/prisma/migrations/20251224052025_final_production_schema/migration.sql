/*
  Warnings:

  - You are about to drop the column `purpose` on the `Otp` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minOrderQty` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - The `id` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Service` table. All the data in the column will be lost.
  - The `id` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cat` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moq` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cat` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loc` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_providerId_fkey";

-- DropIndex
DROP INDEX "Otp_phone_idx";

-- DropIndex
DROP INDEX "Otp_phone_purpose_key";

-- DropIndex
DROP INDEX "Product_category_idx";

-- DropIndex
DROP INDEX "Service_category_idx";

-- DropIndex
DROP INDEX "Service_location_idx";

-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "purpose";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "images",
DROP COLUMN "minOrderQty",
DROP COLUMN "socialLinks",
DROP COLUMN "updatedAt",
ADD COLUMN     "cat" TEXT NOT NULL,
ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "img" TEXT NOT NULL,
ADD COLUMN     "moq" TEXT NOT NULL,
ADD COLUMN     "social" JSONB,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
DROP COLUMN "category",
DROP COLUMN "description",
DROP COLUMN "images",
DROP COLUMN "isVerified",
DROP COLUMN "location",
DROP COLUMN "providerId",
DROP COLUMN "socialLinks",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "cat" TEXT NOT NULL,
ADD COLUMN     "desc" TEXT NOT NULL,
ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "img" TEXT NOT NULL,
ADD COLUMN     "loc" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "reviews" JSONB,
ADD COLUMN     "social" JSONB,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isWorker" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "OtpPurpose";

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Home',
    "line1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_userId_key" ON "Service"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
