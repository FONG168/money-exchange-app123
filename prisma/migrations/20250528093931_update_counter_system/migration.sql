/*
  Warnings:

  - You are about to drop the column `completedTasks` on the `UserCounter` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserCounter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "counterId" INTEGER NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "totalEarnings" REAL NOT NULL DEFAULT 0,
    "dailyCompletedOrders" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TEXT NOT NULL DEFAULT '',
    "lastOrderResetDate" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "canWithdraw" BOOLEAN NOT NULL DEFAULT false,
    "usedToday" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserCounter" ("balance", "canWithdraw", "counterId", "createdAt", "dailyCompletedOrders", "id", "isActive", "lastActivityDate", "lastOrderResetDate", "totalEarnings", "updatedAt", "userId") SELECT "balance", "canWithdraw", "counterId", "createdAt", "dailyCompletedOrders", "id", "isActive", "lastActivityDate", "lastOrderResetDate", "totalEarnings", "updatedAt", "userId" FROM "UserCounter";
DROP TABLE "UserCounter";
ALTER TABLE "new_UserCounter" RENAME TO "UserCounter";
CREATE UNIQUE INDEX "UserCounter_userId_counterId_key" ON "UserCounter"("userId", "counterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
