-- AlterTable
ALTER TABLE "Enrollment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PetCalendarTask" ADD COLUMN     "hasTime" BOOLEAN NOT NULL DEFAULT true;
