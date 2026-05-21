/*
  Warnings:

  - You are about to drop the `blog_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_extras` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "order_item_extras" DROP CONSTRAINT "order_item_extras_extraId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_extras" DROP CONSTRAINT "product_extras_productId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropTable
DROP TABLE "blog_categories";

-- DropTable
DROP TABLE "blog_posts";

-- DropTable
DROP TABLE "categories";

-- DropTable
DROP TABLE "product_extras";

-- DropTable
DROP TABLE "products";

-- DropEnum
DROP TYPE "ExtraType";
