-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Screen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "desktopDone" BOOLEAN NOT NULL DEFAULT false,
    "mobileDone" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT,
    "notes" TEXT
);
INSERT INTO "new_Screen" ("id", "key", "name", "notes", "path", "status", "updatedAt", "updatedBy") SELECT "id", "key", "name", "notes", "path", "status", "updatedAt", "updatedBy" FROM "Screen";
DROP TABLE "Screen";
ALTER TABLE "new_Screen" RENAME TO "Screen";
CREATE UNIQUE INDEX "Screen_key_key" ON "Screen"("key");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
