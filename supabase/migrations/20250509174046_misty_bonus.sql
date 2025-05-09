/*
  # Fix workflow timestamp columns

  1. Changes
    - Rename created_at to createdAt
    - Rename updated_at to updatedAt

  2. Data Preservation
    - Preserves existing timestamp data
*/

ALTER TABLE workflows 
RENAME COLUMN created_at TO "createdAt";

ALTER TABLE workflows 
RENAME COLUMN updated_at TO "updatedAt";