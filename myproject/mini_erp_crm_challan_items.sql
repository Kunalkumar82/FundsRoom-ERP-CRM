-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: mini_erp_crm
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `challan_items`
--

DROP TABLE IF EXISTS `challan_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challan_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `challan_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `product_snapshot` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `challan_id` (`challan_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `challan_items_ibfk_1` FOREIGN KEY (`challan_id`) REFERENCES `sales_challans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `challan_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challan_items`
--

LOCK TABLES `challan_items` WRITE;
/*!40000 ALTER TABLE `challan_items` DISABLE KEYS */;
INSERT INTO `challan_items` VALUES (1,1,1,5,1250.00,6250.00,'{\"id\": 1, \"sku\": \"PRD-IND-001\", \"name\": \"Industrial Sensor Module V3\", \"category\": \"Electronics\", \"unit_price\": 1250}'),(2,2,2,2,2400.00,4800.00,'{\"id\": 2, \"sku\": \"PRD-IND-002\", \"name\": \"Microcontroller Board 32-Bit\", \"category\": \"Electronics\", \"unit_price\": 2400}');
/*!40000 ALTER TABLE `challan_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `business_name` varchar(150) NOT NULL,
  `gst_number` varchar(30) DEFAULT NULL,
  `type` enum('Retail','Wholesale','Distributor') NOT NULL DEFAULT 'Retail',
  `address` text NOT NULL,
  `status` enum('Lead','Active','Inactive') NOT NULL DEFAULT 'Lead',
  `follow_up_date` date DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Apex Industrial Corp','9876543210','contact@apexind.com','Apex Industrial Solutions Pvt Ltd','27AAACA1234A1Z5','Distributor','702 Cyber Heights, Tech Zone, Mumbai','Active','2026-08-15','Key customer for industrial automation gear.','2026-08-09 11:27:26','2026-08-09 11:27:26'),(2,'BlueSky Logistics','9812345678','procurement@bluesky.com','BlueSky Logistics India','27BBBCB5678B1Z6','Wholesale','Plot 45, Cargo Hub, Bhiwandi','Active','2026-08-18','Requires quarterly bulk shipment estimates.','2026-08-09 11:27:26','2026-08-09 11:27:26'),(3,'Acme Electronics Store','9765432109','sales@acmeelectronics.in','Acme Retail Outlets','27CCCC1234C1Z7','Retail','Shop 12, Commercial Complex, Pune','Lead','2026-08-22','Interested in microcontroller kits. Sent quote.','2026-08-09 11:27:26','2026-08-09 11:27:26'),(4,'Zenith Robotics Tech','9988776655','info@zenithrobotics.com','Zenith Systems & Automation',NULL,'Distributor','Sector 5, Electronics City, Bengaluru','Lead','2026-08-25','Follow up regarding motor driver availability.','2026-08-09 11:27:26','2026-08-09 11:27:26');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `category` varchar(80) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `current_stock` int NOT NULL DEFAULT '0',
  `min_stock_alert_qty` int NOT NULL DEFAULT '10',
  `location` varchar(100) NOT NULL DEFAULT 'Main Warehouse',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'PRD-IND-001','Industrial Sensor Module V3','Electronics',1250.00,45,10,'Warehouse A - Rack 12','2026-08-09 11:27:26','2026-08-09 11:27:26'),(2,'PRD-IND-002','Microcontroller Board 32-Bit','Electronics',2400.00,8,15,'Warehouse A - Rack 04','2026-08-09 11:27:26','2026-08-09 11:27:26'),(3,'PRD-PWR-001','High Capacity Li-Ion Battery Pack 24V','Power Solutions',5800.00,25,5,'Warehouse B - Secure Storage','2026-08-09 11:27:26','2026-08-09 11:27:26'),(4,'PRD-MCH-001','Heavy Duty Stepper Motor 10Nm','Machinery',3200.00,3,5,'Warehouse C - Heavy Bay','2026-08-09 11:27:26','2026-08-09 11:27:26'),(5,'PRD-CAB-001','Industrial Ethernet Cable 50m Roll','Cabling',450.00,100,20,'Warehouse D - Spools','2026-08-09 11:27:26','2026-08-09 11:27:26');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_challans`
--

DROP TABLE IF EXISTS `sales_challans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_challans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `challan_number` varchar(50) NOT NULL,
  `customer_id` int NOT NULL,
  `total_quantity` int NOT NULL DEFAULT '0',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('Draft','Confirmed','Cancelled') NOT NULL DEFAULT 'Draft',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `challan_number` (`challan_number`),
  KEY `customer_id` (`customer_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `sales_challans_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `sales_challans_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_challans`
--

LOCK TABLES `sales_challans` WRITE;
/*!40000 ALTER TABLE `sales_challans` DISABLE KEYS */;
INSERT INTO `sales_challans` VALUES (1,'CH-202608-0001',1,5,6250.00,'Confirmed',1,'2026-08-09 11:27:26','2026-08-09 11:27:26'),(2,'CH-202608-0002',2,2,4800.00,'Draft',1,'2026-08-09 11:27:26','2026-08-09 11:27:26');
/*!40000 ALTER TABLE `sales_challans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_logs`
--

DROP TABLE IF EXISTS `stock_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `qty_changed` int NOT NULL,
  `movement_type` enum('IN','OUT') NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `stock_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `stock_logs_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_logs`
--

LOCK TABLES `stock_logs` WRITE;
/*!40000 ALTER TABLE `stock_logs` DISABLE KEYS */;
INSERT INTO `stock_logs` VALUES (1,1,45,'IN','Initial Warehouse Inventory Import',1,'2026-08-09 11:27:26'),(2,2,8,'IN','Initial Warehouse Inventory Import',1,'2026-08-09 11:27:26'),(3,3,25,'IN','Initial Warehouse Inventory Import',1,'2026-08-09 11:27:26'),(4,4,3,'IN','Initial Warehouse Inventory Import',1,'2026-08-09 11:27:26'),(5,5,100,'IN','Initial Warehouse Inventory Import',1,'2026-08-09 11:27:26'),(6,1,5,'OUT','Sales Challan #CH-202608-0001',1,'2026-08-09 11:27:26');
/*!40000 ALTER TABLE `stock_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Sales','Warehouse','Accounts') NOT NULL DEFAULT 'Sales',
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'System Administrator','admin@erp.com','$2a$10$OmEq1dsNmaUZnP8xNwG81uw9Jm8jmak/J23xXzneicHSQJOjk59Gm','Admin','Active','2026-08-09 11:27:26'),(2,'Sales Manager','sales@erp.com','$2a$10$OmEq1dsNmaUZnP8xNwG81uw9Jm8jmak/J23xXzneicHSQJOjk59Gm','Sales','Active','2026-08-09 11:27:26'),(3,'Warehouse Inspector','warehouse@erp.com','$2a$10$OmEq1dsNmaUZnP8xNwG81uw9Jm8jmak/J23xXzneicHSQJOjk59Gm','Warehouse','Active','2026-08-09 11:27:26'),(4,'Accounts Specialist','accounts@erp.com','$2a$10$OmEq1dsNmaUZnP8xNwG81uw9Jm8jmak/J23xXzneicHSQJOjk59Gm','Accounts','Active','2026-08-09 11:27:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-09 22:52:30
