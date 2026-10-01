#!/usr/bin/env bash
# Simple MySQL backup script for the SocioMantra database. Intended to be
# run on a schedule via cron (see backend/README.md for a crontab example).
#
# Usage:
#   DB_PASSWORD=yourpassword ./backup-db.sh [output-directory]
#
# Keeps the last 14 daily backups and deletes anything older, so this can
# run unattended without slowly filling up disk.

set -euo pipefail

DB_NAME="${DB_NAME:-sociomantra_db}"
DB_USER="${DB_USERNAME:-root}"
DB_HOST="${DB_HOST:-localhost}"
OUT_DIR="${1:-./backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"

if [ -z "${DB_PASSWORD:-}" ]; then
  echo "Error: set DB_PASSWORD before running this script." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUT_FILE="$OUT_DIR/sociomantra_db-$TIMESTAMP.sql.gz"

echo "Backing up $DB_NAME to $OUT_FILE ..."
mysqldump \
  --host="$DB_HOST" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" | gzip > "$OUT_FILE"

echo "Done: $(du -h "$OUT_FILE" | cut -f1)"

echo "Removing backups older than $KEEP_DAYS days ..."
find "$OUT_DIR" -name "sociomantra_db-*.sql.gz" -mtime "+$KEEP_DAYS" -delete

echo "Backup complete."
