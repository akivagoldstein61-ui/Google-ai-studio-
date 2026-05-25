CREATE TABLE `ai_eval_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureSlug` varchar(100) NOT NULL,
	`evalName` varchar(200) NOT NULL,
	`evalDescription` text,
	`fixtureInput` json,
	`expectedOutputPattern` text,
	`prohibitedOutputPattern` text,
	`lastRunAt` timestamp,
	`lastResult` enum('pass','fail','skipped'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_eval_registry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_feature_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureSlug` varchar(100) NOT NULL,
	`featureName` varchar(200) NOT NULL,
	`description` text,
	`provider` varchar(100),
	`isEnabled` boolean NOT NULL DEFAULT false,
	`requiresConsent` boolean NOT NULL DEFAULT false,
	`isPrivate` boolean NOT NULL DEFAULT true,
	`allowedRoles` json,
	`prohibitedPatterns` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_feature_registry_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_feature_registry_featureSlug_unique` UNIQUE(`featureSlug`)
);
--> statement-breakpoint
CREATE TABLE `ai_prompt_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureSlug` varchar(100) NOT NULL,
	`promptVersion` varchar(50) NOT NULL,
	`systemPrompt` text NOT NULL,
	`inputSchema` json,
	`outputSchema` json,
	`prohibitedOutputPatterns` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_prompt_registry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`appellantId` int NOT NULL,
	`reason` text NOT NULL,
	`status` enum('open','under_review','upheld','dismissed') NOT NULL DEFAULT 'open',
	`reviewedBy` int,
	`reviewNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`actorRole` varchar(50),
	`eventType` varchar(100) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` varchar(100),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockerId` int NOT NULL,
	`blockedId` int NOT NULL,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matchId` int NOT NULL,
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_matchId_unique` UNIQUE(`matchId`)
);
--> statement-breakpoint
CREATE TABLE `daily_picks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetUserId` int NOT NULL,
	`pickDate` varchar(10) NOT NULL,
	`status` enum('pending','liked','passed','expired') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_picks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `known_failure_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`evidenceLabel` enum('TARGET_VERIFIED','CORPUS_VERIFIED','INFERRED','HEURISTIC','UNKNOWN') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('open','mitigated','resolved') NOT NULL DEFAULT 'open',
	`mitigationNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `known_failure_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user1Id` int NOT NULL,
	`user2Id` int NOT NULL,
	`status` enum('active','unmatched','blocked','paused') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`messageId` int NOT NULL,
	`reason` varchar(200) NOT NULL,
	`details` text,
	`status` enum('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`isAiDraft` boolean NOT NULL DEFAULT false,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderation_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('profile_report','message_report','system') NOT NULL,
	`sourceId` int NOT NULL,
	`assignedModeratorId` int,
	`status` enum('open','in_review','resolved','escalated','appealed') NOT NULL DEFAULT 'open',
	`aiSummary` text,
	`aiConfidence` varchar(20),
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moderation_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderator_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`moderatorId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`rationale` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderator_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`minAge` int,
	`maxAge` int,
	`maxDistanceKm` int,
	`genderPreference` varchar(100),
	`observancePreference` varchar(200),
	`dealbreakers` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `privacy_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestType` enum('export','delete','correction','access') NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privacy_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`url` text NOT NULL,
	`mediaType` enum('photo') NOT NULL DEFAULT 'photo',
	`sortOrder` int NOT NULL DEFAULT 0,
	`isApproved` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`reportedUserId` int NOT NULL,
	`reason` varchar(200) NOT NULL,
	`details` text,
	`status` enum('open','under_review','resolved','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(100),
	`bio` text,
	`birthYear` int,
	`gender` varchar(50),
	`location` varchar(200),
	`observance` varchar(100),
	`relationshipIntent` varchar(100),
	`language` enum('he','en') NOT NULL DEFAULT 'he',
	`isComplete` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `release_checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`version` varchar(50) NOT NULL,
	`checkName` varchar(200) NOT NULL,
	`status` enum('pending','passed','failed','blocked') NOT NULL DEFAULT 'pending',
	`notes` text,
	`checkedBy` int,
	`checkedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `release_checklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_outputs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillId` int NOT NULL,
	`outputData` json NOT NULL,
	`appliedAt` timestamp,
	`isPrivate` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skill_outputs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skill_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`shortTitle` varchar(100),
	`category` varchar(100),
	`description` text,
	`primarySurface` varchar(100),
	`availableSurfaces` json,
	`trigger` varchar(200),
	`userIntentServed` text,
	`requiredInputs` json,
	`optionalInputs` json,
	`outputContract` json,
	`privacyNote` text,
	`safetyLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`consentRequired` boolean NOT NULL DEFAULT false,
	`roleAvailability` json,
	`toolPolicy` text,
	`approvalBoundary` text,
	`failureModes` json,
	`fallbackBehavior` text,
	`acceptanceCriteria` json,
	`status` enum('working','demo_safe','blocked','needs_provider_setup') NOT NULL DEFAULT 'demo_safe',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `skill_registry_id` PRIMARY KEY(`id`),
	CONSTRAINT `skill_registry_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `support_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320),
	`subject` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`status` enum('open','in_progress','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consentType` varchar(100) NOT NULL,
	`granted` boolean NOT NULL,
	`consentVersion` varchar(50),
	`grantedAt` timestamp,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_consents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_skill_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillId` int NOT NULL,
	`status` enum('available','started','completed','applied','dismissed','blocked') NOT NULL DEFAULT 'available',
	`progress` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`completedAt` timestamp,
	`originatingSurface` varchar(100),
	`savedOutputRef` varchar(500),
	`consentSnapshot` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_skill_state_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `values_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` varchar(100) NOT NULL,
	`answer` text NOT NULL,
	`visibility` enum('private','public') NOT NULL DEFAULT 'public',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `values_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','moderator','admin') NOT NULL DEFAULT 'user';