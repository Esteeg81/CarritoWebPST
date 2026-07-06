-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "whatsappOrderTemplate" TEXT NOT NULL DEFAULT 'Nuevo pedido #{pedido}
Cliente: {cliente}
Teléfono: {telefono}
{items}
Total: ${total}';
