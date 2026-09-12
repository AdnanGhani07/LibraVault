# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

We take the security of **LibraVault** seriously. If you discover a security vulnerability, please follow these guidelines:

1. **Do NOT file a public issue.**
2. Send an email with details of the vulnerability to the project maintainers.
3. Include the following details:
   * Description of the vulnerability and its potential impact.
   * Step-by-step reproduction instructions or proof-of-concept (PoC).
   * Affected endpoints, components, or dependencies.
4. We will acknowledge receipt of your report within 48 hours and provide a timeline for triage and remediation.

---

## Security Practices in LibraVault
- **Stateless HMAC-SHA256 JWT Authentication** with short expiration windows.
- **BCrypt Password Hashing** (cost factor 12).
- **Method-Level Role Authorization** (`@PreAuthorize`).
- **Container Security**: Non-root execution (`USER spring:spring` and `USER nextjs:nodejs`).
