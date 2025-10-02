-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 02, 2025 at 05:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `transmittal_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `timestamp`, `quantity`) VALUES
(1, NULL, 'Added new \'In\' record for item: 12345 (Qty: 1)', '2025-10-02 11:09:23', NULL),
(2, NULL, 'Added new \'Out\' record for item: 12345 (Qty: 1)', '2025-10-02 11:10:39', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transmittals`
--

CREATE TABLE `transmittals` (
  `id` int(11) NOT NULL,
  `transaction_type` varchar(4) NOT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `to_entity` varchar(255) NOT NULL,
  `from_entity` varchar(255) NOT NULL,
  `item_description` text NOT NULL,
  `barcode_tag_number` varchar(255) NOT NULL,
  `signature_id` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transmittals`
--

INSERT INTO `transmittals` (`id`, `transaction_type`, `transaction_date`, `to_entity`, `from_entity`, `item_description`, `barcode_tag_number`, `signature_id`, `quantity`) VALUES
(1, 'In', '2025-10-02 11:09:23', 'Nhico', 'IT Dept', 'Macbook', '12345', '12345678nno', 1),
(2, 'Out', '2025-10-02 11:10:39', 'IT Dept', 'Nhico', 'Macbook', '12345', 'nnortazon12345', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transmittals`
--
ALTER TABLE `transmittals`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transmittals`
--
ALTER TABLE `transmittals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
