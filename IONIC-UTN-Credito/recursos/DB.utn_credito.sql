-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-11-2016 a las 20:19:56
-- Versión del servidor: 10.1.13-MariaDB
-- Versión de PHP: 5.6.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `utn_credito`
--
CREATE DATABASE IF NOT EXISTS `utn_credito` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `utn_credito`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_recargas`
--

CREATE TABLE `registro_recargas` (
  `id_usuario` int(50) NOT NULL,
  `id_tarjeta` int(50) NOT NULL,
  `dispositivo` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registro_transferencias`
--

CREATE TABLE `registro_transferencias` (
  `id` int(50) NOT NULL,
  `id_usuario_emisor` int(50) NOT NULL,
  `id_usuario_receptor` int(50) NOT NULL,
  `importe` double(10,2) NOT NULL,
  `dispositivo` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarjetas`
--

CREATE TABLE `tarjetas` (
  `id` int(50) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `credito` double(10,2) NOT NULL,
  `fecha_alta` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `tarjetas`
--

INSERT INTO `tarjetas` (`id`, `codigo`, `credito`, `fecha_alta`, `estado`) VALUES
(1, 'ABC50pE', 50.00, '2016-09-05 04:09:16', 0),
(2, 'AUC50pQ', 50.00, '2016-09-05 04:09:16', 1),
(3, 'ZU100bW', 100.00, '2016-09-05 04:09:43', 1),
(4, 'VR100nT', 100.00, '2016-09-05 04:09:43', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(50) NOT NULL,
  `mail` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `credito` double(10,2) NOT NULL DEFAULT '3000.00',
  `fecha_update_saldo` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `estado` int(5) NOT NULL DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `mail`, `password`, `credito`, `fecha_update_saldo`, `estado`) VALUES
(1, '1@utn.com', '123123', 500.00, '2016-09-14 19:31:26', 1),
(2, '2@utn.com', '123123', 3000.00, '2016-11-10 19:12:39', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `registro_recargas`
--
ALTER TABLE `registro_recargas`
  ADD PRIMARY KEY (`id_usuario`,`id_tarjeta`);

--
-- Indices de la tabla `registro_transferencias`
--
ALTER TABLE `registro_transferencias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `codigo` (`codigo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mail` (`mail`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `registro_transferencias`
--
ALTER TABLE `registro_transferencias`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
