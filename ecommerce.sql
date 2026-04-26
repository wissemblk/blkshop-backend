-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 24 avr. 2026 à 12:34
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ecommerce`
--

-- --------------------------------------------------------

--
-- Structure de la table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 2, '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(2, 3, '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(3, 1, '2026-03-01 00:18:36', '2026-03-01 00:18:36'),
(4, 6, '2026-04-12 09:51:18', '2026-04-12 09:51:18'),
(5, 7, '2026-04-12 12:07:10', '2026-04-12 12:07:10');

-- --------------------------------------------------------

--
-- Structure de la table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `cart_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(1, 1, 1, 1, 1299.99, '2026-02-28 21:39:10'),
(2, 1, 3, 2, 199.99, '2026-02-28 21:39:10');

-- --------------------------------------------------------

--
-- Structure de la table `discounts`
--

CREATE TABLE `discounts` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT NULL,
  `valid_from` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `max_uses` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `discounts`
--

INSERT INTO `discounts` (`id`, `code`, `type`, `value`, `min_purchase`, `valid_from`, `valid_until`, `max_uses`, `used_count`, `is_active`, `created_at`) VALUES
(1, 'WELCOME10', 'percentage', 10.00, 50.00, NULL, NULL, 100, 0, 1, '2026-02-28 21:39:10'),
(2, 'FLAT20', 'fixed', 20.00, 100.00, NULL, NULL, 50, 0, 1, '2026-02-28 21:39:10'),
(3, 'SUMMER25', 'percentage', 25.00, 200.00, NULL, NULL, 30, 0, 1, '2026-02-28 21:39:10'),
(4, 'FREESHIP', 'fixed', 10.00, 50.00, NULL, NULL, 200, 0, 1, '2026-02-28 21:39:10');

-- --------------------------------------------------------

--
-- Structure de la table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_number`, `order_id`, `user_id`, `subtotal`, `discount`, `total`, `created_at`) VALUES
(1, 'INV-1772314750493-001', 1, 2, 1699.97, 0.00, 1699.97, '2026-02-28 21:39:10'),
(2, 'INV-1772314750511-002', 2, 3, 249.99, 0.00, 249.99, '2026-02-28 21:39:10'),
(3, 'INV-1775989684774-cqqyvpp7j', 3, 3, 349.97, 0.00, 349.97, '2026-04-12 10:28:04'),
(4, 'INV-1775994579607-08smpcjfj', 4, 3, 349.97, 0.00, 349.97, '2026-04-12 11:49:39'),
(5, 'INV-1775994584873-o5qbar15q', 5, 3, 349.97, 0.00, 349.97, '2026-04-12 11:49:44'),
(6, 'INV-1775994586004-tdkgruosm', 6, 3, 349.97, 0.00, 349.97, '2026-04-12 11:49:46'),
(7, 'INV-1775994734675-1x84f433e', 7, 3, 349.97, 0.00, 349.97, '2026-04-12 11:52:14'),
(8, 'INV-1775996238024-a79niol90', 8, 6, 2199.98, 0.00, 2199.98, '2026-04-12 12:17:18');

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('En preparation','Expedié','Livré','Annulé') DEFAULT 'En preparation',
  `shipping_address` text NOT NULL,
  `payment_method` enum('Carte','PayPal') NOT NULL,
  `payment_status` enum('En attente','Payé','Echoué','Remboursé') DEFAULT 'En attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total`, `status`, `shipping_address`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(1, 2, 1699.97, 'Livré', '15 Rue de Paris, 75001 Paris', 'Carte', 'Payé', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(2, 3, 249.99, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon', 'PayPal', 'Payé', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(3, 3, 349.97, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'Carte', 'En attente', '2026-04-12 10:28:04', '2026-04-12 10:28:04'),
(4, 3, 349.97, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'Carte', 'En attente', '2026-04-12 11:49:39', '2026-04-12 11:49:39'),
(5, 3, 349.97, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'Carte', 'En attente', '2026-04-12 11:49:44', '2026-04-12 11:49:44'),
(6, 3, 349.97, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'Carte', 'En attente', '2026-04-12 11:49:46', '2026-04-12 11:49:46'),
(7, 3, 349.97, 'En preparation', '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'Carte', 'En attente', '2026-04-12 11:52:14', '2026-04-12 11:52:14'),
(8, 6, 2199.98, 'En preparation', '35, bir, 13000, France', 'Carte', 'En attente', '2026-04-12 12:17:18', '2026-04-12 12:17:18');

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `price`, `total`) VALUES
(1, 1, 1, 'Ordinateur Portable Pro', 1, 1299.99, 1299.99),
(2, 1, 3, 'Casque Audio Sans Fil', 2, 199.99, 399.98),
(3, 2, 7, 'Montre Connectée', 1, 249.99, 249.99),
(4, 3, 3, 'Casque Audio Sans Fil', 1, 199.99, 199.99),
(5, 3, 5, 'Chaussures de Sport', 1, 89.99, 89.99),
(6, 3, 6, 'Sac à Dos Voyage', 1, 59.99, 59.99),
(7, 4, 3, 'Casque Audio Sans Fil', 1, 199.99, 199.99),
(8, 4, 5, 'Chaussures de Sport', 1, 89.99, 89.99),
(9, 4, 6, 'Sac à Dos Voyage', 1, 59.99, 59.99),
(10, 5, 3, 'Casque Audio Sans Fil', 1, 199.99, 199.99),
(11, 5, 5, 'Chaussures de Sport', 1, 89.99, 89.99),
(12, 5, 6, 'Sac à Dos Voyage', 1, 59.99, 59.99),
(13, 6, 3, 'Casque Audio Sans Fil', 1, 199.99, 199.99),
(14, 6, 5, 'Chaussures de Sport', 1, 89.99, 89.99),
(15, 6, 6, 'Sac à Dos Voyage', 1, 59.99, 59.99),
(16, 7, 3, 'Casque Audio Sans Fil', 1, 199.99, 199.99),
(17, 7, 5, 'Chaussures de Sport', 1, 89.99, 89.99),
(18, 7, 6, 'Sac à Dos Voyage', 1, 59.99, 59.99),
(19, 8, 1, 'Ordinateur Portable Pro', 1, 1299.99, 1299.99),
(20, 8, 2, 'Smartphone X12', 1, 899.99, 899.99);

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `description`, `image`, `category`, `created_at`, `updated_at`) VALUES
(1, 'Ordinateur Portable Pro', 1299.99, 'Ordinateur haute performance avec processeur i7, 16Go RAM, SSD 512Go', 'https://m.media-amazon.com/images/I/51n3xVOxxgL._AC_UF894,1000_QL80_.jpg', 'Informatique', '2026-02-28 21:39:10', '2026-04-11 21:46:45'),
(2, 'Smartphone X12', 899.99, 'Écran 6.5\", 128Go stockage, appareil photo 108MP', 'https://cdn.movertix.com/media/catalog/product/cache/image/1200x/r/e/redmi-note-12-pro-5g-dual-sim-polar-white-128gb-and-6gb-ram-side.jpg', 'Téléphonie', '2026-02-28 21:39:10', '2026-04-11 21:50:00'),
(3, 'Casque Audio Sans Fil', 199.99, 'Casque Bluetooth avec réduction de bruit active', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYcy92OzJ5-DfvIhOxs2n_cyaP6rb132Glrcz_u4Yi_hzwK0G1', 'Audio', '2026-02-28 21:39:10', '2026-04-12 09:44:53'),
(4, 'Machine à Café Expresso', 349.99, 'Machine automatique avec broyeur intégré', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStDUVo4m7hCUBPhwVlLodUIL82mRpRtpYpuw&s', 'Électroménager', '2026-02-28 21:39:10', '2026-04-12 09:46:06'),
(5, 'Chaussures de Sport', 89.99, 'Chaussures running confortables, légères', 'shoes.jpg', 'Sport', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(6, 'Sac à Dos Voyage', 59.90, 'Sac résistant à l\'eau, 40L', 'backpack.jpg', 'Accessoires', '2026-02-28 21:39:10', '2026-04-12 12:30:50'),
(7, 'Montre Connectée', 249.99, 'Montre avec GPS, fréquence cardiaque', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhB4CvBLS3MzL4ATyASQzvvvxFlaDx17oZYg&s', 'Électronique', '2026-02-28 21:39:10', '2026-04-12 09:47:14'),
(8, 'Livre \"Programmation Node.js\"', 39.99, 'Apprenez Node.js pas à pas', 'book.jpg', 'Livres', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(10, 'Enceinte Bluetooth', 79.99, 'Enceinte portable waterproof', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3iWJ18zKSZQb9CnwoLfLGlqTmC58zinCMDA&s', 'Audio', '2026-02-28 21:39:10', '2026-04-12 09:48:29'),
(11, 'ordi', 300.00, 'desc', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7-5LdMUnjD47t1t27aA7cjKvRRjgsN_itJg&s', 'tech', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `shipping`
--

CREATE TABLE `shipping` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address` text NOT NULL,
  `status` enum('En preparation','Expedié','Livré','Retardé') DEFAULT 'En preparation',
  `tracking_number` varchar(100) DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `shipping`
--

INSERT INTO `shipping` (`id`, `order_id`, `user_id`, `address`, `status`, `tracking_number`, `carrier`, `estimated_delivery`, `created_at`, `updated_at`) VALUES
(1, 1, 2, '15 Rue de Paris, 75001 Paris', 'Livré', 'TRACK123456', 'DHL', NULL, '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(2, 2, 3, '8 Avenue Victor Hugo, 69002 Lyon', 'En preparation', NULL, NULL, NULL, '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(3, 3, 3, '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'En preparation', NULL, NULL, NULL, '2026-04-12 10:28:04', '2026-04-12 10:28:04'),
(4, 4, 3, '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'En preparation', NULL, NULL, NULL, '2026-04-12 11:49:39', '2026-04-12 11:49:39'),
(5, 5, 3, '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'En preparation', NULL, NULL, NULL, '2026-04-12 11:49:44', '2026-04-12 11:49:44'),
(6, 6, 3, '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'En preparation', NULL, NULL, NULL, '2026-04-12 11:49:46', '2026-04-12 11:49:46'),
(7, 7, 3, '8 Avenue Victor Hugo, 69002 Lyon, 13000, France', 'En preparation', NULL, NULL, NULL, '2026-04-12 11:52:14', '2026-04-12 11:52:14'),
(8, 8, 6, '35, bir, 13000, France', 'En preparation', NULL, NULL, NULL, '2026-04-12 12:17:18', '2026-04-12 12:17:18');

-- --------------------------------------------------------

--
-- Structure de la table `stock`
--

CREATE TABLE `stock` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stock`
--

INSERT INTO `stock` (`id`, `product_id`, `quantity`, `low_stock_threshold`, `updated_at`) VALUES
(1, 1, 7, 5, '2026-04-12 12:17:18'),
(2, 2, 20, 5, '2026-04-12 12:17:18'),
(3, 3, 16, 5, '2026-04-12 11:52:14'),
(4, 4, 28, 5, '2026-02-28 21:39:10'),
(5, 5, 51, 5, '2026-04-12 11:52:14'),
(6, 6, 15, 5, '2026-04-12 11:52:14'),
(7, 7, 22, 5, '2026-02-28 21:39:10'),
(8, 8, 21, 5, '2026-02-28 21:39:10'),
(10, 10, 20, 5, '2026-02-28 21:39:10');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','client') DEFAULT 'client',
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@example.com', '$2a$10$Kg3y9Z/OgHU2GtRCEMC9O.iJIKH6J4aa5l6pqPVbrg9oli3sM.Yca', 'admin', NULL, '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(2, 'Jean Dupont', 'jean@example.com', '$2a$10$Qc96.9c3uswvfY74WMUvX.qgOcg4ooaNJa.Z5l4.GvKE1YPRMbGI6', 'client', '15 Rue de Paris, 75001 Paris', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(3, 'Marie Martin', 'marie@example.com', '$2a$10$Qc96.9c3uswvfY74WMUvX.qgOcg4ooaNJa.Z5l4.GvKE1YPRMbGI6', 'client', '8 Avenue Victor Hugo, 69002 Lyon', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(4, 'Pierre Durand', 'pierre@example.com', '$2a$10$Qc96.9c3uswvfY74WMUvX.qgOcg4ooaNJa.Z5l4.GvKE1YPRMbGI6', 'client', '23 Boulevard Saint-Germain, 75005 Paris', '2026-02-28 21:39:10', '2026-02-28 21:39:10'),
(5, 'wissem', 'wissem@gmail.com', '$2a$10$dlqpSjhcBkDFfemFifSlkOIgsc6ASLLyoqTbQjOs3MqclCXvCxVXi', 'client', '33,birouana sud,13000,tlemcen', '2026-02-28 22:33:33', '2026-02-28 22:33:33'),
(6, 'blk', 'blk@gmail.com', '$2a$10$bbfvgQ0FuUU7YmLNa/cFbOhH6V4hkyl9EcV9ZvSMkrPc4Gfm5Tf1C', 'client', '35,bir,13000,tlemecen', '2026-03-01 00:14:33', '2026-03-01 00:14:33'),
(7, 'ines', 'ines@example.com', '$2a$10$n4HaNn8pOYvBSj7UBgvase/MGVQdHpMfwExx7QSWYHgkONiNIgFlS', 'client', '22,bel aire,13000,tlemcen', '2026-04-12 12:07:10', '2026-04-12 12:07:10');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user` (`user_id`);

--
-- Index pour la table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_cart_items_cart_id` (`cart_id`);

--
-- Index pour la table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_discounts_code` (`code`),
  ADD KEY `idx_discounts_valid_until` (`valid_until`);

--
-- Index pour la table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_invoices_order_id` (`order_id`),
  ADD KEY `idx_invoices_user_id` (`user_id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_user_id` (`user_id`),
  ADD KEY `idx_orders_status` (`status`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `idx_order_items_order_id` (`order_id`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category`);

--
-- Index pour la table `shipping`
--
ALTER TABLE `shipping`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_order` (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_shipping_order_id` (`order_id`);

--
-- Index pour la table `stock`
--
ALTER TABLE `stock`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_product` (`product_id`),
  ADD KEY `idx_stock_product_id` (`product_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `shipping`
--
ALTER TABLE `shipping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `stock`
--
ALTER TABLE `stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `shipping`
--
ALTER TABLE `shipping`
  ADD CONSTRAINT `shipping_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `shipping_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
