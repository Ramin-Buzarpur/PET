-- CreateEnum
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT', 'BIRD', 'FISH', 'REPTILE', 'RODENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PetGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "CalendarType" AS ENUM ('JALALI', 'GREGORIAN');

-- CreateEnum
CREATE TYPE "BirthPrecision" AS ENUM ('EXACT', 'ESTIMATED');

-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('HEIGHT', 'WEIGHT');

-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM ('WELCOME', 'PET_WELCOME', 'BIRTHDAY', 'FIRST_MONTH', 'CARD_NUDGE', 'BIRTHDAY_NUDGE', 'CALENDAR_REMINDER', 'COURSE_DONE', 'COURSE_NUDGE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PANEL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT_MOCK', 'SKIPPED');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'DISMISSED', 'ACTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "friendlySmsOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingSmsOptIn" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "species" "PetSpecies",
    "speciesOther" TEXT,
    "breed" TEXT,
    "gender" "PetGender" NOT NULL DEFAULT 'UNKNOWN',
    "birthDateValue" TEXT,
    "birthCalendar" "CalendarType",
    "birthPrecision" "BirthPrecision",
    "approxAgeYears" INTEGER,
    "approxAgeMonths" INTEGER,
    "approxAgeAsOf" TIMESTAMP(3),
    "photoUrl" TEXT,
    "illness" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "chatNotes" TEXT,
    "membershipCode" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetMeasurement" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" "MeasurementType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "measuredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetCardShare" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "showPhoto" BOOLEAN NOT NULL DEFAULT false,
    "showSpecies" BOOLEAN NOT NULL DEFAULT false,
    "showBreed" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetCardShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "titleCipher" TEXT,
    "bodyCipher" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalUnlockMeta" (
    "userId" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "wrappedKeyByPassphrase" TEXT NOT NULL,
    "wrappedKeyByRecovery" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalUnlockMeta_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "PetCalendarTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT,
    "text" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "reminderOffsets" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetCalendarTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT,
    "kind" "NotificationKind" NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "petNameOnCert" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetStory" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryReport" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatPetConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "consentVersion" INTEGER NOT NULL DEFAULT 1,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatPetConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pet_membershipCode_key" ON "Pet"("membershipCode");

-- CreateIndex
CREATE INDEX "PetMeasurement_petId_type_measuredAt_idx" ON "PetMeasurement"("petId", "type", "measuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PetCardShare_token_key" ON "PetCardShare"("token");

-- CreateIndex
CREATE INDEX "JournalEntry_petId_createdAt_idx" ON "JournalEntry"("petId", "createdAt");

-- CreateIndex
CREATE INDEX "PetCalendarTask_userId_dueAt_idx" ON "PetCalendarTask"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_dedupeKey_key" ON "NotificationLog"("dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_enrollmentId_key" ON "Certificate"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_serialNumber_key" ON "Certificate"("serialNumber");

-- CreateIndex
CREATE INDEX "PetStory_status_createdAt_idx" ON "PetStory"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoryReport_storyId_reporterUserId_key" ON "StoryReport"("storyId", "reporterUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatPetConsent_userId_petId_key" ON "ChatPetConsent"("userId", "petId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetMeasurement" ADD CONSTRAINT "PetMeasurement_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetCardShare" ADD CONSTRAINT "PetCardShare_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalUnlockMeta" ADD CONSTRAINT "JournalUnlockMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetCalendarTask" ADD CONSTRAINT "PetCalendarTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetCalendarTask" ADD CONSTRAINT "PetCalendarTask_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetStory" ADD CONSTRAINT "PetStory_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryReport" ADD CONSTRAINT "StoryReport_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "PetStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryReport" ADD CONSTRAINT "StoryReport_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPetConsent" ADD CONSTRAINT "ChatPetConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatPetConsent" ADD CONSTRAINT "ChatPetConsent_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
