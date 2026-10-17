CREATE TABLE `applications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `brief_id` int(10) UNSIGNED NOT NULL,
  `application_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `demo` varchar(500) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_brief` (`user_id`,`brief_id`),
  ADD KEY `fk_brief` (`brief_id`);


ALTER TABLE `applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;


ALTER TABLE `applications`
  ADD CONSTRAINT `fk_brief` FOREIGN KEY (`brief_id`) REFERENCES `briefs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;