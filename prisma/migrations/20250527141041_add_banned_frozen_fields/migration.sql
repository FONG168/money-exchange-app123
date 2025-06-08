-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "balance" REAL NOT NULL DEFAULT 0,
    "earnings" REAL NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "totalBalance" REAL NOT NULL DEFAULT 0,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "frozen" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("balance", "completedTasks", "createdAt", "earnings", "email", "firstName", "id", "joinDate", "lastName", "password", "totalBalance", "updatedAt") SELECT "balance", "completedTasks", "createdAt", "earnings", "email", "firstName", "id", "joinDate", "lastName", "password", "totalBalance", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
