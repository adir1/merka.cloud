CREATE TABLE cloud_registry_without_name (
  cloud_id TEXT PRIMARY KEY NOT NULL,
  signed_record TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cloud_registry_without_name (cloud_id, signed_record, created_at)
SELECT cloud_id, signed_record, created_at FROM cloud_registry;

DROP TABLE cloud_registry;

ALTER TABLE cloud_registry_without_name RENAME TO cloud_registry;
