/*
  # Add Icon column to Categories table
  
  ## Changes
  - Add `icon` column to `categories` table (text, nullable for backward compatibility)
*/

ALTER TABLE "public"."categories" ADD COLUMN "icon" text;
