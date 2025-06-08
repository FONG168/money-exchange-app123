-- CreateTable
CREATE TABLE "CurrencyPair" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
