CREATE INDEX "post_tags_tag_idx" ON "post_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "posts_search_idx" ON "posts" USING gin (to_tsvector('simple', coalesce("title", '') || ' ' || coalesce("content", '')));--> statement-breakpoint
CREATE INDEX "tags_status_idx" ON "tags" USING btree ("status");