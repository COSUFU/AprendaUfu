-- CreateEnum
CREATE TYPE "Role" AS ENUM ('student', 'teacher');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'student';
