/*
  Warnings:
  - You are about to drop the `order_item_extras` table.
  - You are about to drop the `order_items` table.
  - You are about to drop the `orders` table.
  - Orders are now managed exclusively by Payload CMS.
*/

-- DropForeignKey
ALTER TABLE "order_item_extras" DROP CONSTRAINT "order_item_extras_itemId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropTable
DROP TABLE "order_item_extras";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropEnum
DROP TYPE "OrderStatus";
