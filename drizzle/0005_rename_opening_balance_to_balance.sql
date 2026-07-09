ALTER TABLE `accounts` RENAME COLUMN `opening_balance` TO `balance`;--> statement-breakpoint
UPDATE `accounts`
SET `balance` = `balance` + COALESCE(
  (SELECT SUM(CASE WHEN `kind` = 'income' THEN `amount` ELSE -`amount` END)
   FROM `transactions` WHERE `transactions`.`account_id` = `accounts`.`id`),
  0
);
