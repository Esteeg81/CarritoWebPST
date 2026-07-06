-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "fontFamily" TEXT NOT NULL DEFAULT 'sans-serif',
    "textColor" TEXT NOT NULL DEFAULT '#1e293b',
    "headerBg" TEXT NOT NULL DEFAULT '#0f172a',
    "footerBg" TEXT NOT NULL DEFAULT '#ffffff',
    "mainBg" TEXT NOT NULL DEFAULT '#f8fafc',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
