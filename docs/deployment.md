# Deployment

This project uses [Alchemy](https://alchemy.run) to deploy to Cloudflare Workers. Deployments are automated via GitHub Actions.

## Environments

| Branch | Stage  | GitHub Environment |
| ------ | ------ | ------------------ |
| `main` | `main` | `main`             |
| `dev`  | `dev`  | `dev`              |

Local development uses `dev` stage with local state (FileSystemStateStore in `.alchemy/`), so it won't conflict with deployed environments.

## GitHub Setup

### 1. Create GitHub Environments

Go to **Settings > Environments** and create two environments: `dev` and `main`.

### 2. Add Secrets

Add these secrets to **both** environments:

| Secret                   | Description                | Same for both?                      |
| ------------------------ | -------------------------- | ----------------------------------- |
| `ALCHEMY_STATE_TOKEN`    | State store authentication | Yes (shared per Cloudflare account) |
| `ALCHEMY_PASSWORD`       | Encrypts secrets in state  | **No** - use different passwords    |
| `CLOUDFLARE_API_TOKEN`   | Cloudflare API access      | Yes                                 |
| `API_BETTER_AUTH_SECRET` | Auth session signing       | **No** - use different secrets      |

#### How to get each secret

- **`ALCHEMY_STATE_TOKEN`**: Generate with `openssl rand -base64 32`. Use the same value for all environments.
- **`ALCHEMY_PASSWORD`**: Generate with `openssl rand -base64 32`. Use a **different** value per environment.
- **`CLOUDFLARE_API_TOKEN`**: Create at [Cloudflare Dashboard > My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens). Use the "Edit Cloudflare Workers" template or create a custom token with Workers, D1, and KV permissions. Alchemy will automatically resolve your account ID from this token.
- **`API_BETTER_AUTH_SECRET`**: Generate with `openssl rand -base64 32`. Use a **different** value per environment.

> **Note**: `CLOUDFLARE_ACCOUNT_ID` is optional. Alchemy automatically resolves it from your API token. Only set it explicitly if your token has access to multiple Cloudflare accounts.

### 3. Add Variables

Add these variables to each environment (Settings > Environments > [env] > Environment variables):

| Variable              | `dev`                        | `main`                   |
| --------------------- | ---------------------------- | ------------------------ |
| `API_BETTER_AUTH_URL` | `https://api.dev.verion.app` | `https://api.verion.app` |
| `API_CORS_ORIGIN`     | `https://dev.verion.app`     | `https://verion.app`     |
| `VITE_API_URL`        | `https://api.dev.verion.app` | `https://api.verion.app` |
| `WEB_DOMAIN`          | `dev.verion.app`             | `verion.app`             |
| `API_DOMAIN`          | `api.dev.verion.app`         | `api.verion.app`         |

#### How to get each variable

- **`API_BETTER_AUTH_URL`**: The public URL of your API (e.g., `https://api.verion.app`).
- **`API_CORS_ORIGIN`**: The URL of your web app (e.g., `https://verion.app`).
- **`VITE_API_URL`**: Same as `API_BETTER_AUTH_URL` - the API endpoint your frontend calls.
- **`WEB_DOMAIN`**: Custom domain for the web worker (must be registered in Cloudflare).
- **`API_DOMAIN`**: Custom domain for the API worker (must be registered in Cloudflare).

## Custom Domains

Custom domains are configured via `WEB_DOMAIN` and `API_DOMAIN` environment variables. They are only applied when `ALCHEMY_REMOTE_STATE=true` (i.e., in CI or when managing remote environments locally).

The domain must be registered in Cloudflare. Alchemy will automatically create the DNS records and bind the workers to the custom domains.

| Worker | `dev`                | `main`           |
| ------ | -------------------- | ---------------- |
| Web    | `dev.verion.app`     | `verion.app`     |
| API    | `api.dev.verion.app` | `api.verion.app` |

## Resource Naming

Resources are named with the stage suffix:

| Resource    | `dev`                   | `main`                   |
| ----------- | ----------------------- | ------------------------ |
| D1 Database | `verion-db-dev`         | `verion-db-main`         |
| API Worker  | `verion-worker-api-dev` | `verion-worker-api-main` |
| Web Worker  | `verion-worker-web-dev` | `verion-worker-web-main` |

## State Management

- **CI deployments**: Use `CloudflareStateStore` (Durable Objects on Cloudflare)
- **Local development**: Use `FileSystemStateStore` (`.alchemy/` directory)

The state token (`ALCHEMY_STATE_TOKEN`) is shared across all environments in a Cloudflare account, but state is isolated per app/stage.

## Managing Remote Environments Locally

To manage remote environments from your local machine, set `ALCHEMY_REMOTE_STATE=true` along with the required environment variables.

### Required Environment Variables

These must be set for all remote operations:

```bash
export ALCHEMY_REMOTE_STATE=true
export ALCHEMY_STATE_TOKEN=<your-state-token>
export ALCHEMY_PASSWORD=<password-for-target-stage>
export CLOUDFLARE_API_TOKEN=<your-cloudflare-token>
export API_BETTER_AUTH_SECRET=<secret-for-target-stage>
```

### Deploying

```bash
# Deploy to dev
ALCHEMY_STAGE=dev \
WEB_DOMAIN=dev.verion.app \
API_DOMAIN=api.dev.verion.app \
API_CORS_ORIGIN=https://dev.verion.app \
API_BETTER_AUTH_URL=https://api.dev.verion.app \
pnpx alchemy deploy

# Deploy to production
ALCHEMY_STAGE=main \
WEB_DOMAIN=verion.app \
API_DOMAIN=api.verion.app \
API_CORS_ORIGIN=https://verion.app \
API_BETTER_AUTH_URL=https://api.verion.app \
pnpx alchemy deploy
```

### Destroying Resources

To destroy all resources in an environment:

```bash
# Destroy dev environment
ALCHEMY_STAGE=dev \
WEB_DOMAIN=dev.verion.app \
API_DOMAIN=api.dev.verion.app \
API_CORS_ORIGIN=https://dev.verion.app \
API_BETTER_AUTH_URL=https://api.dev.verion.app \
pnpx alchemy destroy

# Destroy production environment
ALCHEMY_STAGE=main \
WEB_DOMAIN=verion.app \
API_DOMAIN=api.verion.app \
API_CORS_ORIGIN=https://verion.app \
API_BETTER_AUTH_URL=https://api.verion.app \
pnpx alchemy destroy
```

> **Warning**: `alchemy destroy` will delete all resources in the target stage including the D1 database and all its data. This action is irreversible.

### What Gets Deleted

When you run `alchemy destroy`, the following resources are removed:

- **Workers**: `verion-worker-api-{stage}`, `verion-worker-web-{stage}`
- **D1 Database**: `verion-db-{stage}` (including all data)
- **Custom Domains**: DNS bindings for the stage's domains
- **State**: The stage's state in CloudflareStateStore

## Password Recovery

If you lose `ALCHEMY_PASSWORD`:

1. Encrypted secrets in state become **permanently inaccessible**
2. You must delete affected resources and recreate them
3. Generate a new password and update the GitHub secret

Always store passwords securely and never commit them to source control.
