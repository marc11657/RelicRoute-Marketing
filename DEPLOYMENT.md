# RelicRoute Marketing Site — Deployment

## Infrastructure

| Resource        | Details                                              |
|-----------------|------------------------------------------------------|
| S3 Bucket       | `relicroute-website` (eu-west-2 London)              |
| CloudFront      | `E3MEF61HCX2RQV` → `d3276tbqcklwyh.cloudfront.net`  |
| SSL Certificate | Issued for `relicroute.co.uk` + `*.relicroute.co.uk` |
| DNS             | A + AAAA records for both apex and www                |
| Price Class     | `PriceClass_100` (US + Europe — cheapest, covers UK) |

## Live URLs

- https://relicroute.co.uk
- https://www.relicroute.co.uk

HTTP automatically redirects to HTTPS.

## Deploying Updates

Upload changed files to S3, then invalidate the CloudFront cache:

```bash
aws s3 sync . s3://relicroute-website --exclude ".git/*" --exclude "_docs/*" --exclude "*.md"
aws cloudfront create-invalidation --distribution-id E3MEF61HCX2RQV --paths "/*"
```
