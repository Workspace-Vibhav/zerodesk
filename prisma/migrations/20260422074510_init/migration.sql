-- CreateTable
CREATE TABLE "Screen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Screen_key_key" ON "Screen"("key");
