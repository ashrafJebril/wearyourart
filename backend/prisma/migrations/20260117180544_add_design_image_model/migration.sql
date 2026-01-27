-- CreateTable
CREATE TABLE "DesignImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT,
    "placement" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignImage_sessionId_idx" ON "DesignImage"("sessionId");

-- CreateIndex
CREATE INDEX "DesignImage_productId_idx" ON "DesignImage"("productId");

-- AddForeignKey
ALTER TABLE "DesignImage" ADD CONSTRAINT "DesignImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
