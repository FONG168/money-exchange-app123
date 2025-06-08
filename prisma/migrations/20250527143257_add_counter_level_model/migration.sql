-- CreateTable
CREATE TABLE "CounterLevel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "minDeposit" REAL NOT NULL,
    "dailyOrders" INTEGER NOT NULL,
    "commission" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "exchangeAmountMin" REAL NOT NULL,
    "exchangeAmountMax" REAL NOT NULL
);
