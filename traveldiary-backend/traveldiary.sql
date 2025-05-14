/*
 Navicat Premium Data Transfer

 Source Server         : MyWork
 Source Server Type    : MySQL
 Source Server Version : 80037 (8.0.37)
 Source Host           : localhost:3306
 Source Schema         : traveldiary

 Target Server Type    : MySQL
 Target Server Version : 80037 (8.0.37)
 File Encoding         : 65001

 Date: 12/05/2025 19:26:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for diaries
-- ----------------------------
DROP TABLE IF EXISTS `diaries`;
CREATE TABLE `diaries`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('pending','approved','rejected','deleted') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending',
  `rejection_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `diaries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of diaries
-- ----------------------------


-- ----------------------------
-- Table structure for diary_comments
-- ----------------------------
DROP TABLE IF EXISTS `diary_comments`;
CREATE TABLE `diary_comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `diary_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `diary_id`(`diary_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `diary_comments_ibfk_1` FOREIGN KEY (`diary_id`) REFERENCES `diaries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `diary_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of diary_comments
-- ----------------------------

-- ----------------------------
-- Table structure for diary_images
-- ----------------------------
DROP TABLE IF EXISTS `diary_images`;
CREATE TABLE `diary_images`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `diary_id` int NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sort_order` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `diary_id`(`diary_id` ASC) USING BTREE,
  CONSTRAINT `diary_images_ibfk_1` FOREIGN KEY (`diary_id`) REFERENCES `diaries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of diary_images
-- ----------------------------

-- ----------------------------
-- Table structure for diary_likes
-- ----------------------------
DROP TABLE IF EXISTS `diary_likes`;
CREATE TABLE `diary_likes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `diary_id` int NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_like`(`user_id` ASC, `diary_id` ASC) USING BTREE,
  INDEX `diary_id`(`diary_id` ASC) USING BTREE,
  CONSTRAINT `diary_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `diary_likes_ibfk_2` FOREIGN KEY (`diary_id`) REFERENCES `diaries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of diary_likes
-- ----------------------------

-- ----------------------------
-- Table structure for diary_videos
-- ----------------------------
DROP TABLE IF EXISTS `diary_videos`;
CREATE TABLE `diary_videos`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `diary_id` int NOT NULL,
  `video_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `diary_id`(`diary_id` ASC) USING BTREE,
  CONSTRAINT `diary_videos_ibfk_1` FOREIGN KEY (`diary_id`) REFERENCES `diaries` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of diary_videos
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'huhao', '123456', 'huhao', '/avatars/default.png', '2025-05-12 06:14:51');
INSERT INTO `users` VALUES (2, 'test', 'test', 'testuser', '/avatars/8838f5fd-f5f3-474b-9498-f2846dd63be9.jpg', '2025-05-12 06:16:58');

SET FOREIGN_KEY_CHECKS = 1;
