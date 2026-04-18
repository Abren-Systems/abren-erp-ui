---
title: "Development Credentials"
description: "If your local database is empty, run the seed script to provision the default user:"
tier: frontend
tags: [frontend]
---

# Development Credentials

> **For local development only. Never commit real credentials.**

## Default Administrator

| Field    | Value             |
| -------- | ----------------- |
| Email    | `admin@abren.com` |
| Password | `admin123`        |
| Tenant   | Abren Dev         |
| Role     | Administrator     |

## Provisioning

If your local database is empty, run the seed script to provision the default user:

```bash
cd abren-api
python scripts/seed_dev.py
```

The script is idempotent — safe to run multiple times.

## Default Permissions (Administrator Role)

| Permission               | Scope                    |
| ------------------------ | ------------------------ |
| `core:manage_users`      | Create/edit users        |
| `core:manage_roles`      | Create/edit roles        |
| `core:manage_tenants`    | Tenant configuration     |
| `ledger:view`            | View Chart of Accounts   |
| `ledger:post`            | Post Journal Entries     |
| `ledger:manage_accounts` | Create/edit GL Accounts  |
| `workflows:approve`      | Approve workflow steps   |
| `workflows:view`         | View workflow queues     |
| `payments:approve`       | Approve Payment Requests |
| `payments:view`          | View Payment Requests    |
