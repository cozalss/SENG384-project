#!/usr/bin/env bash
# HEALTH AI — S3 + CloudFront deploy.
#
# Usage:
#   ./deploy.sh <bucket-name> <cloudfront-distribution-id>
#
# Example:
#   ./deploy.sh healthai-prod E1ABCDEFGHIJKL
#
# Prereqs:
#   - AWS CLI v2 installed and `aws configure` done
#   - CloudFront distribution already created, pointed at the S3 bucket
#   - S3 bucket is either public-read OR uses Origin Access Control (OAC)
#
# What this does:
#   1. Build the app (npm run build)
#   2. Sync all hashed assets to S3 with 1-year immutable cache
#   3. Upload index.html separately with no-cache header
#   4. Invalidate CloudFront so users see the new deploy immediately

set -euo pipefail

BUCKET="${1:-}"
DIST_ID="${2:-}"

if [[ -z "$BUCKET" || -z "$DIST_ID" ]]; then
  echo "Usage: $0 <bucket-name> <cloudfront-distribution-id>"
  exit 1
fi

echo "→ Building production bundle..."
npm run build

echo "→ Syncing /assets to s3://$BUCKET/assets (immutable cache)..."
aws s3 sync dist/assets/ "s3://$BUCKET/assets/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

echo "→ Syncing root files (excluding index.html)..."
aws s3 sync dist/ "s3://$BUCKET/" \
  --delete \
  --exclude "index.html" \
  --exclude "assets/*" \
  --cache-control "public, max-age=3600"

echo "→ Uploading index.html with no-cache..."
aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8"

echo "→ Invalidating CloudFront distribution $DIST_ID..."
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/index.html" "/" \
  --query 'Invalidation.Id' \
  --output text

echo "✓ Deploy complete."
