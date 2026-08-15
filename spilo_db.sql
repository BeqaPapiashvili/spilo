SET FOREIGN_KEY_CHECKS = 0;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'CUSTOMER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_phone_key`(`phone`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `childrenJson` TEXT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Brand` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Brand_name_key`(`name`),
    UNIQUE INDEX `Brand_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NOT NULL,
    `discountPrice` DOUBLE NULL,
    `discountPercentage` INTEGER NULL,
    `monthlyInstallment` DOUBLE NULL,
    `stock` INTEGER NOT NULL DEFAULT 10,
    `categoryId` VARCHAR(191) NOT NULL,
    `brandId` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `specs` JSON NULL,
    `colorName` VARCHAR(191) NULL,
    `storage` VARCHAR(191) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isFlashDeal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `sessionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_userId_key`(`userId`),
    UNIQUE INDEX `Cart_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `shippingAddress` TEXT NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    `status` ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `totalAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `image` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT 'admin123',
    `role` VARCHAR(191) NOT NULL DEFAULT 'SUPER_ADMIN',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `adminEmail` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promotion` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `image` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `discountPercentage` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coupon` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discount` DOUBLE NOT NULL,
    `validUntil` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `image` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportTicket` (
    `id` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `userPhone` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
    `messages` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `Brand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;



-- ==========================================
-- SEED DATA INSERTS
-- ==========================================

INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('dji', 'DJI', 'dji', 'https://veli.store/media-cdn/__sized__/brand/dji_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='DJI';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('apple', 'Apple', 'apple', 'https://veli.store/media-cdn/__sized__/brand/apple_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Apple';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('samsung', 'Samsung', 'samsung', 'https://veli.store/media-cdn/__sized__/brand/samsung_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Samsung';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('sony', 'Sony', 'sony', 'https://veli.store/media-cdn/__sized__/brand/sony_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Sony';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('asus', 'ASUS', 'asus', 'https://veli.store/media-cdn/__sized__/brand/asus_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='ASUS';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('marshall', 'Marshall', 'marshall', 'https://veli.store/media-cdn/__sized__/brand/marshall_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Marshall';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('jbl', 'JBL', 'jbl', 'https://veli.store/media-cdn/__sized__/brand/jbl_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='JBL';
INSERT INTO `Brand` (`id`, `name`, `slug`, `logo`, `createdAt`, `updatedAt`) VALUES ('xiaomi', 'Xiaomi', 'xiaomi', 'https://veli.store/media-cdn/__sized__/brand/xiaomi_logo-thumbnail-100x100-95.png', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Xiaomi';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('mobiles', 'მობილურები', 'mobiles', 'Smartphone', '[{"id":"mobiles-brands","name":"მობილურის ბრენდები","slug":"mobiles-brands","productCount":210,"items":[{"id":"mob-apple","name":"Apple","slug":"iphones","brandQuery":"apple"},{"id":"mob-samsung","name":"Samsung","slug":"androids","brandQuery":"samsung"},{"id":"mob-xiaomi","name":"Xiaomi","slug":"androids","brandQuery":"xiaomi"},{"id":"mob-poco","name":"Poco","slug":"androids","brandQuery":"poco"},{"id":"mob-vivo","name":"Vivo","slug":"androids","brandQuery":"vivo"},{"id":"mob-google","name":"Google","slug":"androids","brandQuery":"google"},{"id":"mob-nothing","name":"Nothing","slug":"androids","brandQuery":"nothing"},{"id":"mob-oneplus","name":"OnePlus","slug":"androids","brandQuery":"oneplus"},{"id":"mob-realme","name":"Realme","slug":"androids","brandQuery":"realme"},{"id":"mob-oppo","name":"Oppo","slug":"androids","brandQuery":"oppo"},{"id":"mob-zte","name":"ZTE","slug":"androids","brandQuery":"zte"},{"id":"mob-motorola","name":"Motorola","slug":"androids","brandQuery":"motorola"},{"id":"mob-blackview","name":"Blackview","slug":"androids","brandQuery":"blackview"}]},{"id":"wireless-chargers-sub","name":"უსადენო დამტენები","slug":"wireless-chargers","productCount":85,"items":[{"id":"wc-apple","name":"Apple","slug":"chargers","brandQuery":"apple"},{"id":"wc-samsung","name":"Samsung","slug":"chargers","brandQuery":"samsung"},{"id":"wc-xiaomi","name":"Xiaomi","slug":"chargers","brandQuery":"xiaomi"},{"id":"wc-ugreen","name":"Ugreen","slug":"chargers","brandQuery":"ugreen"},{"id":"wc-belkin","name":"Belkin","slug":"chargers","brandQuery":"belkin"},{"id":"wc-havit","name":"Havit","slug":"chargers","brandQuery":"havit"},{"id":"wc-hoco","name":"Hoco","slug":"chargers","brandQuery":"hoco"},{"id":"wc-anker","name":"Anker","slug":"chargers","brandQuery":"anker"}]},{"id":"earphones-buds","name":"ყურსასმენები Buds","slug":"earphones-buds","productCount":140,"items":[{"id":"eb-airpods","name":"Apple Airpods","slug":"wireless-earphones","brandQuery":"apple"},{"id":"eb-galaxy","name":"Galaxy Buds","slug":"wireless-earphones","brandQuery":"samsung"},{"id":"eb-xiaomi","name":"Xiaomi Buds","slug":"wireless-earphones","brandQuery":"xiaomi"},{"id":"eb-sony","name":"Sony Buds","slug":"wireless-earphones","brandQuery":"sony"},{"id":"eb-nothing","name":"Nothing Buds","slug":"wireless-earphones","brandQuery":"nothing"},{"id":"eb-realme","name":"Realme Buds","slug":"wireless-earphones","brandQuery":"realme"},{"id":"eb-jbl","name":"JBL Buds","slug":"wireless-earphones","brandQuery":"jbl"},{"id":"eb-oneplus","name":"OnePlus Buds","slug":"wireless-earphones","brandQuery":"oneplus"},{"id":"eb-marshall","name":"Marshall Buds","slug":"wireless-earphones","brandQuery":"marshall"},{"id":"eb-motorola","name":"Motorola Buds","slug":"wireless-earphones","brandQuery":"motorola"},{"id":"eb-vivo","name":"Vivo Buds","slug":"wireless-earphones","brandQuery":"vivo"},{"id":"eb-accs","name":"Buds-ის აქსესუარები","slug":"wireless-earphones"}]},{"id":"charger-adapters-main","name":"დამტენი ადაპტერი","slug":"charger-adapters","productCount":95,"items":[{"id":"ca-apple","name":"Apple Adapter","slug":"chargers","brandQuery":"apple"},{"id":"ca-samsung","name":"Samsung Adapter","slug":"chargers","brandQuery":"samsung"},{"id":"ca-anker","name":"Anker Adapter","slug":"chargers","brandQuery":"anker"},{"id":"ca-spigen","name":"Spigen Adapter","slug":"chargers","brandQuery":"spigen"},{"id":"ca-belkin","name":"Belkin Adapter","slug":"chargers","brandQuery":"belkin"},{"id":"ca-ugreen","name":"Ugreen Adapter","slug":"chargers","brandQuery":"ugreen"},{"id":"ca-xiaomi","name":"Xiaomi adapter","slug":"chargers","brandQuery":"xiaomi"},{"id":"ca-baseus","name":"Baseus Adapter","slug":"chargers","brandQuery":"baseus"}]},{"id":"mobile-cases-main","name":"მობილურის ჩასადებები","slug":"mobile-cases","productCount":180,"items":[{"id":"mc-google","name":"For Google","slug":"phone-cases","brandQuery":"google"},{"id":"mc-realme","name":"For Realme","slug":"phone-cases","brandQuery":"realme"},{"id":"mc-apple","name":"For Apple","slug":"phone-cases","brandQuery":"apple"},{"id":"mc-samsung","name":"For Samsung","slug":"phone-cases","brandQuery":"samsung"},{"id":"mc-honor","name":"For Honor","slug":"phone-cases","brandQuery":"honor"},{"id":"mc-xiaomi","name":"For Xiaomi","slug":"phone-cases","brandQuery":"xiaomi"},{"id":"mc-oppo","name":"For Oppo","slug":"phone-cases","brandQuery":"oppo"},{"id":"mc-motorola","name":"For Motorola","slug":"phone-cases","brandQuery":"motorola"},{"id":"mc-nothing","name":"For Nothing","slug":"phone-cases","brandQuery":"nothing"},{"id":"mc-oneplus","name":"For Oneplus","slug":"phone-cases","brandQuery":"oneplus"}]},{"id":"mobile-accessories-main","name":"მობილურის აქსესუარები","slug":"mobile-accessories","productCount":160,"items":[{"id":"ma-screen","name":"ეკრანის დამცავები","slug":"phone-cases"},{"id":"ma-stabs","name":"მობილურის სტაბილიზატორები","slug":"phone-cases"},{"id":"ma-connectors","name":"კონექტორები","slug":"phone-cases"},{"id":"ma-cables","name":"კაბელები","slug":"phone-cases"},{"id":"ma-triggers","name":"სათამაშო ტრიგერები","slug":"phone-cases"},{"id":"ma-memory","name":"მეხსიერების ბარათი","slug":"phone-cases"},{"id":"ma-gps","name":"GPS ტრეკერები","slug":"phone-cases"},{"id":"ma-camera-prot","name":"კამერის დამცავები","slug":"phone-cases"},{"id":"ma-selfie","name":"სელფის ჯოხები","slug":"phone-cases"},{"id":"ma-otg","name":"OTG ფლეშ მეხსიერებები","slug":"phone-cases"}]},{"id":"smartwatches-sub-main","name":"სმარტ საათები","slug":"smartwatches-sub","productCount":120,"items":[{"id":"sw-apple","name":"Apple Watch","slug":"smartwatches","brandQuery":"apple"},{"id":"sw-galaxy","name":"Galaxy Watch","slug":"smartwatches","brandQuery":"samsung"},{"id":"sw-xiaomi","name":"Xiaomi Watch","slug":"smartwatches","brandQuery":"xiaomi"},{"id":"sw-google","name":"Google Watch","slug":"smartwatches","brandQuery":"google"},{"id":"sw-amazfit","name":"Amazfit Watch","slug":"smartwatches","brandQuery":"amazfit"},{"id":"sw-garmin","name":"Garmin Watch","slug":"smartwatches","brandQuery":"garmin"},{"id":"sw-oneplus","name":"OnePlus Watch","slug":"smartwatches","brandQuery":"oneplus"},{"id":"sw-nothing","name":"Nothing Watch","slug":"smartwatches","brandQuery":"nothing"},{"id":"sw-accs","name":"საათის აქსესუარები","slug":"smartwatches"},{"id":"sw-lagenio","name":"Lagenio Watch","slug":"smartwatches","brandQuery":"lagenio"}]},{"id":"power-banks-main","name":"Power banks","slug":"power-banks","productCount":90,"items":[{"id":"pb-anker","name":"Anker","slug":"chargers","brandQuery":"anker"},{"id":"pb-ugreen","name":"Ugreen","slug":"chargers","brandQuery":"ugreen"},{"id":"pb-xiaomi","name":"Xiaomi","slug":"chargers","brandQuery":"xiaomi"},{"id":"pb-lenovo","name":"Lenovo","slug":"chargers","brandQuery":"lenovo"},{"id":"pb-ecoflow","name":"EcoFlow","slug":"chargers","brandQuery":"ecoflow"},{"id":"pb-belkin","name":"Belkin","slug":"chargers","brandQuery":"belkin"},{"id":"pb-samsung","name":"Samsung","slug":"chargers","brandQuery":"samsung"}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='მობილურები';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('tablets', 'ტაბები', 'tablets', 'Tablet', '[{"id":"tablet-brands","name":"ბრენდები","slug":"tablet-brands","productCount":50,"items":[{"id":"apple-ipads","name":"Apple iPads","slug":"ipads","brandQuery":"apple","productCount":18},{"id":"samsung-galaxy-tab","name":"Samsung Galaxy Tab","slug":"android-tablets","brandQuery":"samsung","productCount":20},{"id":"xiaomi-pad","name":"Xiaomi Pad & Redmi Pad","slug":"android-tablets","brandQuery":"xiaomi","productCount":12}]},{"id":"tablet-accessories","name":"ტაბის ჩასადებები & სტილუსები","slug":"tablet-accessories","productCount":35,"items":[{"id":"apple-pencil","name":"Apple Pencil & Smart Keyboards","slug":"tablet-accessories","brandQuery":"apple","productCount":15},{"id":"tablet-cases","name":"დამცავი ქეისები & შუშები","slug":"tablet-accessories","productCount":20}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='ტაბები';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('smartwatches', 'სმარტ საათები', 'smartwatches', 'Watch', '[{"id":"watch-brands","name":"ბრენდები","slug":"watch-brands","productCount":65,"items":[{"id":"apple-watch-main","name":"Apple Watch Series & Ultra","slug":"smartwatches","brandQuery":"apple","productCount":24},{"id":"galaxy-watch-main","name":"Samsung Galaxy Watch","slug":"smartwatches","brandQuery":"samsung","productCount":18},{"id":"xiaomi-band-main","name":"Xiaomi Smart Band & Watch","slug":"smartwatches","brandQuery":"xiaomi","productCount":15},{"id":"garmin-main","name":"Garmin & Huawei Watch","slug":"smartwatches","brandQuery":"garmin","productCount":8}]},{"id":"watch-straps","name":"საათის სამაჯურები & დამტენები","slug":"watch-straps","productCount":40,"items":[{"id":"silicone-straps","name":"სილიკონის & სპორტული სამაჯურები","slug":"smartwatches","productCount":25},{"id":"watch-chargers","name":"უსადენო დამტენი კაბელები","slug":"smartwatches","productCount":15}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='სმარტ საათები';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('laptops', 'ლეპტოპები | IT', 'laptops', 'Laptop', '[{"id":"laptop-brands","name":"ბრენდები","slug":"laptop-brands","productCount":95,"items":[{"id":"macbooks-main","name":"Apple MacBook Air & Pro","slug":"macbooks","brandQuery":"apple","productCount":25},{"id":"asus-laptops","name":"ASUS ROG & TUF Gaming","slug":"gaming-laptops","brandQuery":"asus","productCount":30},{"id":"lenovo-laptops","name":"Lenovo Legion & IdeaPad","slug":"gaming-laptops","brandQuery":"lenovo","productCount":22},{"id":"dell-laptops","name":"Dell XPS & Latitude","slug":"ultrabooks","brandQuery":"dell","productCount":18}]},{"id":"laptop-accs","name":"ლეპტოპის აქსესუარები","slug":"laptop-accs","productCount":45,"items":[{"id":"laptop-bags-main","name":"ლეპტოპის ჩანთები & შალითები","slug":"laptop-bags","productCount":25},{"id":"usb-hubs","name":"Type-C ჰაბები & სადგურები","slug":"laptop-bags","productCount":20}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='ლეპტოპები | IT';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('audio-systems', 'აუდიო სისტემა', 'audio-systems', 'Headphones', '[{"id":"audio-brands","name":"ბრენდები","slug":"audio-brands","productCount":120,"items":[{"id":"brand-apple","name":"Apple","slug":"audio-systems","brandQuery":"apple"},{"id":"brand-samsung","name":"Samsung","slug":"audio-systems","brandQuery":"samsung"},{"id":"brand-xiaomi","name":"Xiaomi","slug":"audio-systems","brandQuery":"xiaomi"},{"id":"brand-jbl","name":"JBL","slug":"audio-systems","brandQuery":"jbl"},{"id":"brand-sony","name":"Sony","slug":"audio-systems","brandQuery":"sony"},{"id":"brand-bose","name":"Bose","slug":"audio-systems","brandQuery":"bose"},{"id":"brand-beats","name":"Beats","slug":"audio-systems","brandQuery":"beats"},{"id":"brand-realme","name":"Realme","slug":"audio-systems","brandQuery":"realme"},{"id":"brand-marshall","name":"Marshall","slug":"audio-systems","brandQuery":"marshall"}]},{"id":"headphones-sub","name":"ყურსასმენები","slug":"headphones","productCount":95,"items":[{"id":"head-headphones","name":"Headphones","slug":"headphones"},{"id":"head-buds","name":"Buds","slug":"headphones"},{"id":"head-earphones","name":"Earphones","slug":"headphones"},{"id":"head-gaming","name":"Gaming","slug":"headphones"},{"id":"head-sport","name":"სპორტული","slug":"headphones"},{"id":"head-kids","name":"საბავშვო","slug":"headphones"}]},{"id":"audio-equipment","name":"აუდიო ტექნიკა","slug":"audio-equipment","productCount":75,"items":[{"id":"eq-portable","name":"პორტატული დინამიკები","slug":"audio-equipment"},{"id":"eq-home","name":"სახლის დინამიკები","slug":"audio-equipment"},{"id":"eq-turntables","name":"ფირსაკრავები","slug":"audio-equipment"},{"id":"eq-smart","name":"სმარტ ასისტენტები","slug":"audio-equipment"},{"id":"eq-soundbar","name":"Soundbar","slug":"audio-equipment"}]},{"id":"microphones","name":"მიკროფონები","slug":"microphones","productCount":50,"items":[{"id":"mic-streaming","name":"სტრიმინგ მიკროფონები","slug":"microphones"},{"id":"mic-gaming","name":"გეიმინგ მიკროფონები","slug":"microphones"},{"id":"mic-lavalier","name":"ლაველური მიკროფონები","slug":"microphones"},{"id":"mic-wireless","name":"უსადენო მიკროფონები","slug":"microphones"},{"id":"mic-camera","name":"ფოტოაპარატის მიკროფონები","slug":"microphones"}]},{"id":"audio-accessories","name":"აქსესუარები","slug":"audio-accessories","productCount":65,"items":[{"id":"acc-powerbanks","name":"Power Banks","slug":"accessories"},{"id":"acc-extensions","name":"დენის დამაგრძელებლები","slug":"accessories"},{"id":"acc-cables","name":"კაბელები","slug":"accessories"},{"id":"acc-wireless-chargers","name":"უსადენო დამტენები","slug":"accessories"}]},{"id":"charging-adapters","name":"დამტენი ადაპტერი","slug":"charging-adapters","productCount":80,"items":[{"id":"ad-apple","name":"Apple Adapter","slug":"chargers"},{"id":"ad-samsung","name":"Samsung Adapter","slug":"chargers"},{"id":"ad-anker","name":"Anker Adapter","slug":"chargers"},{"id":"ad-spigen","name":"Spigen Adapter","slug":"chargers"},{"id":"ad-belkin","name":"Belkin Adapter","slug":"chargers"},{"id":"ad-ugreen","name":"Ugreen Adapter","slug":"chargers"},{"id":"ad-xiaomi","name":"Xiaomi adapter","slug":"chargers"},{"id":"ad-baseus","name":"Baseus Adapter","slug":"chargers"}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='აუდიო სისტემა';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('gaming', 'Gaming', 'gaming', 'Gamepad2', '[{"id":"gaming-consoles-sub","name":"სათამაშო კონსოლები","slug":"gaming-consoles-sub","productCount":45,"items":[{"id":"ps5-main","name":"PlayStation 5 Slim & Digital","slug":"playstation","brandQuery":"sony","productCount":18},{"id":"xbox-main","name":"Xbox Series X & Series S","slug":"xbox","brandQuery":"microsoft","productCount":12},{"id":"nintendo-main","name":"Nintendo Switch OLED","slug":"nintendo","brandQuery":"nintendo","productCount":15}]},{"id":"gaming-accessories","name":"გეიმინგ აქსესუარები","slug":"gaming-accessories","productCount":70,"items":[{"id":"dualsense-main","name":"DualSense & Xbox Controllers","slug":"gamepads","productCount":30},{"id":"steelseries-headsets","name":"SteelSeries & Razer Headsets","slug":"gamepads","productCount":40}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Gaming';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('tv-monitors', 'TV | მონიტორები', 'tv-monitors', 'Tv', '[{"id":"televisions","name":"ტელევიზორები","slug":"televisions","productCount":50,"items":[{"id":"samsung-tv","name":"Samsung QLED & Neo QLED TV","slug":"monitors","brandQuery":"samsung","productCount":20},{"id":"lg-tv","name":"LG OLED 4K Smart TV","slug":"monitors","brandQuery":"lg","productCount":18},{"id":"xiaomi-tv","name":"Xiaomi TV Max & A Pro","slug":"monitors","brandQuery":"xiaomi","productCount":12}]},{"id":"gaming-monitors","name":"გეიმინგ მონიტორები","slug":"gaming-monitors","productCount":40,"items":[{"id":"odyssey-monitors","name":"Samsung Odyssey 240Hz","slug":"monitors","brandQuery":"samsung","productCount":15},{"id":"dell-monitors","name":"Dell XPS & Alienware Monitors","slug":"monitors","brandQuery":"dell","productCount":15},{"id":"asus-monitors","name":"ASUS ROG Swift Gaming Monitors","slug":"monitors","brandQuery":"asus","productCount":10}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='TV | მონიტორები';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('photo-video', 'ფოტო | ვიდეო', 'photo-video', 'Camera', '[{"id":"drones-cams","name":"დრონები & კამერები","slug":"drones-cams","productCount":40,"items":[{"id":"dji-drones-all","name":"DJI Neo, Mini 4 Pro & Air 3","slug":"mini-drones","brandQuery":"dji","productCount":15},{"id":"action-cameras-all","name":"GoPro Hero & Insta360 X4","slug":"action-cams","brandQuery":"gopro","productCount":15},{"id":"sony-alpha","name":"Sony Alpha Mirrorless Cameras","slug":"action-cams","brandQuery":"sony","productCount":10}]},{"id":"gimbals-accessories","name":"სტაბილიზატორები & აქსესუარები","slug":"gimbals-accessories","productCount":35,"items":[{"id":"osmo-pocket","name":"DJI Osmo Pocket 3 & Mobile 6","slug":"gimbals","brandQuery":"dji","productCount":15},{"id":"tripods-lighting","name":"შტატივები & განათების სინათლე","slug":"camera-accessories","productCount":20}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='ფოტო | ვიდეო';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('scooters', 'სკუტერები', 'scooters', 'Sparkles', '[{"id":"electric-scooters","name":"ელექტრო სკუტერები","slug":"electric-scooters","productCount":25,"items":[{"id":"ninebot-scooters","name":"Ninebot Segway MAX & F-Series","slug":"electric-scooters","brandQuery":"ninebot","productCount":12},{"id":"xiaomi-scooters","name":"Xiaomi Electric Scooter 4 Pro","slug":"electric-scooters","brandQuery":"xiaomi","productCount":8},{"id":"dualtron-scooters","name":"Dualtron & Kaabo High Power","slug":"electric-scooters","brandQuery":"dualtron","productCount":5}]},{"id":"scooter-accs","name":"ჩაფხუტები & დამცავები","slug":"scooter-accs","productCount":20,"items":[{"id":"helmets","name":"უსაფრთხოების ჩაფხუტები & საკეტები","slug":"electric-scooters","productCount":20}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='სკუტერები';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('smart-home', 'ჭკვიანი სახლი', 'smart-home', 'Home', '[{"id":"vacuums","name":"მტვერსასრუტები","slug":"vacuums","productCount":35,"items":[{"id":"dreame-vacuums","name":"Dreame L20 & L10 Ultra","slug":"robot-vacuums","brandQuery":"dreame","productCount":12},{"id":"dyson-vacuums","name":"Dyson V15 Detect & Gen5","slug":"cordless-vacuums","brandQuery":"dyson","productCount":13},{"id":"roborock-vacuums","name":"Roborock S8 & Q Revo","slug":"robot-vacuums","brandQuery":"roborock","productCount":10}]},{"id":"home-appliances","name":"საყოფაცხოვრებო ჭკვიანი ტექნიკა","slug":"home-appliances","productCount":40,"items":[{"id":"coffee-makers","name":"Ariete Espresso Coffee Machines","slug":"coffee-machines","brandQuery":"ariete","productCount":15},{"id":"philips-hue","name":"Philips Hue Smart Lighting","slug":"smart-lighting","brandQuery":"philips","productCount":25}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='ჭკვიანი სახლი';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('beauty', 'Beauty', 'beauty', 'Sparkles', '[{"id":"hair-styler","name":"თმის მოვლა & სტაილერი","slug":"hair-styler","productCount":30,"items":[{"id":"dyson-airwrap","name":"Dyson Airwrap Multi-styler","slug":"beauty","brandQuery":"dyson","productCount":12},{"id":"dyson-supersonic","name":"Dyson Supersonic Hair Dryer","slug":"beauty","brandQuery":"dyson","productCount":10},{"id":"philips-straighteners","name":"Philips MoistureProtect Straightener","slug":"beauty","brandQuery":"philips","productCount":8}]},{"id":"personal-care","name":"პირადი ჰიგიენა & მოვლა","slug":"personal-care","productCount":25,"items":[{"id":"braun-shavers","name":"Braun Series 9 Shavers & Trimmers","slug":"beauty","brandQuery":"braun","productCount":15},{"id":"philips-sonicare","name":"Philips Sonicare Toothbrushes","slug":"beauty","brandQuery":"philips","productCount":10}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Beauty';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('car-accessories', 'მანქანის აქსესუარები', 'car-accessories', 'Sparkles', '[{"id":"car-electronics","name":"ავტო ელექტრონიკა","slug":"car-electronics","productCount":45,"items":[{"id":"dvr-cameras","name":"70mai & Xiaomi DVR ვიდეორეგისტრატორები","slug":"car-accessories","brandQuery":"xiaomi","productCount":20},{"id":"fm-transmitters","name":"Baseus FM ტრანსმიტერები & დამტენები","slug":"car-accessories","brandQuery":"baseus","productCount":25}]},{"id":"car-holders-cleaners","name":"ავტო ჰოლდერები & მტვერსასრუტები","slug":"car-holders-cleaners","productCount":30,"items":[{"id":"baseus-holders","name":"Baseus MagSafe Car Mounts","slug":"car-accessories","brandQuery":"baseus","productCount":18},{"id":"car-vacuums","name":"პორტატული ავტო მტვერსასრუტები","slug":"car-accessories","productCount":12}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='მანქანის აქსესუარები';
INSERT INTO `Category` (`id`, `name`, `slug`, `icon`, `childrenJson`, `parentId`, `createdAt`, `updatedAt`) VALUES ('accessories', 'აქსესუარები', 'accessories', 'Sparkles', '[{"id":"daily-accessories","name":"ყოველდღიური აქსესუარები","slug":"daily-accessories","productCount":50,"items":[{"id":"backpacks","name":"Thule & Baseus ლეპტოპის ზურგჩანთები","slug":"accessories","productCount":25},{"id":"wallets-organizers","name":"საფულეები & საკაბელო ორგანაიზერები","slug":"accessories","productCount":25}]}]', NULL, NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='აქსესუარები';
INSERT INTO `Product` (`id`, `title`, `slug`, `sku`, `description`, `price`, `discountPrice`, `discountPercentage`, `monthlyInstallment`, `stock`, `categoryId`, `brandId`, `images`, `specs`, `colorName`, `storage`, `isFeatured`, `isFlashDeal`, `createdAt`, `updatedAt`) VALUES ('dji-neo', 'დრონი DJI Neo Drone Gray', 'dji-neo-drone-gray', 'DJI-NEO-001', 'კომპაქტური და მსუბუქი დრონი 4K ვიდეო გადაღებით და ხელის გულიდან აფრენის ფუნქციით.', 699, 599, 14, 24, 15, 'photo-video', 'dji', '["https://veli.store/media-cdn/__sized__/products/DJI_Neo_Drone_Gray_1-thumbnail-510x510-70.jpg","https://veli.store/media-cdn/__sized__/products/DJI_Neo_Drone_Gray_2-thumbnail-510x510-70.jpg"]', '{"წონა":"135 გრ","ვიდეო":"4K Ultra HD","ფრენის დრო":"18 წთ"}', NULL, NULL, 1, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE `title`='დრონი DJI Neo Drone Gray';
INSERT INTO `Product` (`id`, `title`, `slug`, `sku`, `description`, `price`, `discountPrice`, `discountPercentage`, `monthlyInstallment`, `stock`, `categoryId`, `brandId`, `images`, `specs`, `colorName`, `storage`, `isFeatured`, `isFlashDeal`, `createdAt`, `updatedAt`) VALUES ('iphone-16-pro', 'смартфон Apple iPhone 16 Pro 128GB Natural Titanium', 'apple-iphone-16-pro-128gb-natural-titanium', 'APL-IP16P-128', 'ახალი generation iPhone A18 Pro ჩიპით, ტიტანის კორპუსით და პროფესიონალური კამერის სისტემით.', 3699, 3499, 5, 145, 8, 'mobiles', 'apple', '["https://veli.store/media-cdn/__sized__/products/apple_iphone_16_pro_natural_titanium_1-thumbnail-510x510-70.jpg"]', '{"ეკრანი":"6.3 Super Retina XDR","ჩიპი":"A18 Pro","მეხსიერება":"128 GB"}', NULL, NULL, 1, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE `title`='смартфон Apple iPhone 16 Pro 128GB Natural Titanium';
INSERT INTO `Product` (`id`, `title`, `slug`, `sku`, `description`, `price`, `discountPrice`, `discountPercentage`, `monthlyInstallment`, `stock`, `categoryId`, `brandId`, `images`, `specs`, `colorName`, `storage`, `isFeatured`, `isFlashDeal`, `createdAt`, `updatedAt`) VALUES ('sony-wh-1000xm5', 'უსადენო ყურსასმენი Sony WH-1000XM5 Black', 'sony-wh-1000xm5-black', 'SNY-WH1000XM5-BLK', 'ინდუსტრიაში საუკეთესო ხმაურის ჩახშობის (Noise Cancelling) ტექნოლოგია და პრემიუმ ჟღერადობა.', 1199, 999, 17, 41, 20, 'audio-systems', 'sony', '["https://veli.store/media-cdn/__sized__/products/sony_wh1000xm5_black_1-thumbnail-510x510-70.jpg"]', '{"აკუმულატორი":"30 საათი","Noise Cancelling":"დიახ","წონა":"250 გრ"}', NULL, NULL, 1, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE `title`='უსადენო ყურსასმენი Sony WH-1000XM5 Black';
INSERT INTO `Product` (`id`, `title`, `slug`, `sku`, `description`, `price`, `discountPrice`, `discountPercentage`, `monthlyInstallment`, `stock`, `categoryId`, `brandId`, `images`, `specs`, `colorName`, `storage`, `isFeatured`, `isFlashDeal`, `createdAt`, `updatedAt`) VALUES ('samsung-s24-ultra', 'სმარტფონი Samsung Galaxy S24 Ultra 12GB/256GB Titanium Gray', 'samsung-galaxy-s24-ultra-titanium-gray', 'SAM-S24U-256', 'Galaxy AI ფუნქციები, 200 MP კამერა და ჩაშენებული S Pen.', 3399, 2999, 12, 125, 12, 'mobiles', 'samsung', '["https://veli.store/media-cdn/__sized__/products/samsung_s24_ultra_gray_1-thumbnail-510x510-70.jpg"]', '{"ეკრანი":"6.8 Dynamic AMOLED 2X","პროცესორი":"Snapdragon 8 Gen 3","ოპერატიული":"12 GB"}', NULL, NULL, 1, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE `title`='სმარტფონი Samsung Galaxy S24 Ultra 12GB/256GB Titanium Gray';
INSERT INTO `User` (`id`, `phone`, `email`, `name`, `role`, `createdAt`, `updatedAt`) VALUES ('admin-user', '599000000', 'admin@spilo.ge', 'Super Admin', 'SUPER_ADMIN', NOW(), NOW()) ON DUPLICATE KEY UPDATE `name`='Super Admin';


SET FOREIGN_KEY_CHECKS = 1;
