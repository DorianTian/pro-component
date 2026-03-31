# CI/CD Setup Guide - Required Configuration

## Required GitHub Repository Settings

### Repository-level variables/configuration

| Name                   | Purpose                                | Rotation |
| ---------------------- | -------------------------------------- | -------- |
| `TURBO_TOKEN`          | Turborepo remote cache authentication  | 90 days  |
| `TURBO_TEAM`           | Turborepo remote cache team identifier | Static   |
| `SLACK_WEBHOOK_URL`    | Slack notification webhook             | 90 days  |
| `WECHAT_WEBHOOK_URL`   | WeChat Work bot webhook                | 90 days  |
| `NETLIFY_AUTH_TOKEN`   | Netlify docs deployment                | 90 days  |
| `NETLIFY_DOCS_SITE_ID` | Netlify site identifier for docs       | Static   |

### Environment: `production`

| Name                 | Purpose                                    | Rotation      |
| -------------------- | ------------------------------------------ | ------------- |
| `NPM_TOKEN`          | npm publish (granular, scoped to `@pro/*`) | 90 days       |
| `CDN_OIDC_ROLE_ARN`  | OIDC federation role for CDN uploads       | Static (role) |
| `CDN_BASE_URL`       | CDN base URL                               | Static        |
| `CDN_STORAGE_BUCKET` | CDN storage bucket name                    | Static        |
| `CDN_EDGE_POPS`      | Comma-separated edge PoP identifiers       | Static        |
| `PLATFORM_API_URL`   | Version management platform API URL        | Static        |
| `PLATFORM_API_KEY`   | Platform API authentication key            | 90 days       |

Protection rules:

- Required reviewers: 1 from `@pro-components-ci-team`
- Wait timer: 0 minutes
- Deployment branches: `main` only

### Environment: `docs-production`

Inherits `NETLIFY_AUTH_TOKEN` and `NETLIFY_DOCS_SITE_ID` from repository-level.

Protection rules:

- Required reviewers: none (auto-deploy after npm publish)
- Deployment branches: `main` only

## OIDC Federation Setup (CDN)

Instead of long-lived CDN credentials, use GitHub Actions OIDC federation:

1. Create an IAM role in your cloud provider (AWS/Alibaba Cloud)
2. Configure trust policy to accept tokens from GitHub Actions:
   - Subject: `repo:your-org/pro-components:environment:production`
   - Audience: `sts.amazonaws.com` (AWS) or equivalent
3. Grant the role write access to the CDN storage bucket only
4. Store the role ARN as `CDN_OIDC_ROLE_ARN`

Benefits:

- No long-lived credentials to rotate
- Scoped to specific repository + environment
- Automatic token expiration (1 hour)
- Audit trail via cloud provider IAM logs

## Rotation Companion Variables

For each item with a rotation policy, store a companion `*_CREATED_AT` value
with the ISO date it was last rotated:

- `CDN_ACCESS_KEY_CREATED_AT`: e.g., `2026-01-15`
- `PLATFORM_API_KEY_CREATED_AT`: e.g., `2026-01-15`
- `SLACK_WEBHOOK_URL_CREATED_AT`: e.g., `2026-01-15`
- `WECHAT_WEBHOOK_URL_CREATED_AT`: e.g., `2026-01-15`

The nightly pipeline checks these dates and alerts when within
14 days of the 90-day rotation threshold.

## npm Token Scoping

Use npm granular access tokens (not classic tokens):

1. Go to npmjs.com -> Access Tokens -> Generate New Token -> Granular Access Token
2. Scope: Read and write
3. Packages: Only select packages matching `@pro/*`
4. IP allowlist: GitHub Actions IP ranges (optional, recommended)
5. Expiration: 90 days
