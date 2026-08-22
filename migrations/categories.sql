CREATE TABLE `brief`.`categories`(
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL UNIQUE,
    `rank` INT UNSIGNED NOT NULL,
    PRIMARY KEY(`id`)
) ENGINE = InnoDB;