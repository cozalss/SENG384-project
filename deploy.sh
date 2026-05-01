#!/usr/bin/env bash
# HEALTH AI — S3 (+ optional CloudFront) deploy.
#
# Usage:
#   ./deploy.sh <bucket-name> [cloudfront-distribution-id]
#
# Examples:
#   ./deploy.sh healthai-prod E1ABCDEFGHIJKL   # S3 + CloudFront
#   ./deploy.sh healthai-prod                  # S3 static website only
#
# Prereqs:
#   - AWS CLI v2 installed and `aws configure` done
#   - S3 bucket exists; if no CloudFront, configure as a static website
#     with index.html as the index document AND error document (404)
#
# Pipeline:
#   1. Clean + build the production bundle
#   2. Copy index.html → 404.html so SPA routes resolve under plain S3
#      static hosting (CloudFront should also point its 403/404 custom
#      error response at /index.html with a 200 status code)
#   3. Sync hashed assets to S3 with 1-year immutable cache
#   4. Sync remaining root files (videos, icons) with 1-hour cache
#   5. Upload index.html + 404.html with no-cache headers so a new
#      deploy is picked up on the next page load
#   6. If a CloudFront distribution ID was provided, invalidate
#      /index.html, /404.html, and /

set -euo pipefail

BUCKET="${1:-}"
DIST_ID="${2:-}"

if [[ -z "$BUCKET" ]]; then
  echo "Usage: $0 <bucket-name> [cloudfront-distribution-id]"
  exit 1
fi

echo "→ Cleaning previous build..."
rm -rf dist

echo "→ Building production bundle..."
npm run build

echo "→ Adding SPA routing fallback (404.html → index.html copy)..."
cp dist/index.html dist/404.html

echo "→ Syncing /assets to s3://$BUCKET/assets (immutable cache)..."
aws s3 sync dist/assets/ "s3://$BUCKET/assets/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

echo "→ Syncing root assets (videos, icons) with 1-hour cache..."
aws s3 sync dist/ "s3://$BUCKET/" \
  --delete \
  --exclude "index.html" \
  --exclude "404.html" \
  --exclude "assets/*" \
  --cache-control "public, max-age=3600"

echo "→ Uploading index.html with no-cache..."
aws s3 cp dist/index.html "s3://$BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8"

echo "→ Uploading 404.html with no-cache (SPA fallback)..."
aws s3 cp dist/404.html "s3://$BUCKET/404.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8"

if [[ -n "$DIST_ID" ]]; then
  echo "→ Invalidating CloudFront distribution $DIST_ID..."
  aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths "/index.html" "/404.html" "/" \
    --query 'Invalidation.Id' \
    --output text
else
  echo "→ Skipping CloudFront invalidation (no distribution id provided)"
fi

echo "✓ Deploy complete."
