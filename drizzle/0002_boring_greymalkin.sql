CREATE SEQUENCE IF NOT EXISTS "users_uid_seq";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "uid" integer;--> statement-breakpoint
WITH numbered_users AS (
	SELECT
		"id",
		row_number() OVER (ORDER BY "created_at", "id")::integer AS "uid"
	FROM "users"
)
UPDATE "users"
SET "uid" = numbered_users."uid"
FROM numbered_users
WHERE "users"."id" = numbered_users."id";--> statement-breakpoint
SELECT setval(
	'"users_uid_seq"',
	COALESCE((SELECT max("uid") FROM "users"), 0) + 1,
	false
);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "uid" SET DEFAULT nextval('"users_uid_seq"'::regclass);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "uid" SET NOT NULL;--> statement-breakpoint
ALTER SEQUENCE "users_uid_seq" OWNED BY "users"."uid";--> statement-breakpoint
CREATE UNIQUE INDEX "users_uid_unique" ON "users" USING btree ("uid");
