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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-09 22:11:00
