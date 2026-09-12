# Contributing to LibraVault

Thank you for your interest in contributing to **LibraVault**! We welcome contributions from developers of all skill levels.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/LibraVault.git
cd LibraVault
```

### 2. Branching Strategy
Create a feature branch from `main`:
```bash
git checkout -b feature/my-new-feature
# or for bug fixes:
git checkout -b fix/issue-description
```

### 3. Local Development Stack
Start the local PostgreSQL container:
```bash
docker compose up -d postgres
```

Run backend tests:
```bash
mvn test -f backend/pom.xml
```

Run frontend in development mode:
```bash
cd frontend
npm install
npm run dev
```

---

## Coding Standards

### Backend (Spring Boot 3 + Java 21)
- Follow standard Java naming conventions and clean architecture layer boundaries (Controller &rarr; Service &rarr; Repository).
- Ensure all business operations modifying inventory use `@Transactional` with appropriate locking safeguards (`@Lock(LockModeType.PESSIMISTIC_WRITE)`).
- Return standardized JSON error envelopes through `GlobalExceptionHandler`.
- Write unit/integration tests with JUnit 5, AssertJ, and MockMvc for all new endpoints.

### Frontend (Next.js 15 + TypeScript + Tailwind CSS)
- Maintain strict TypeScript types (no `any` types where possible).
- Use Tailwind CSS and the `cn(...)` utility helper for dynamic classes.
- Ensure all protected views use the `<ProtectedRoute>` component.
- Verify production builds pass cleanly: `npm run build`.

---

## Submitting Pull Requests

1. Run the full test suite locally before pushing:
   ```bash
   mvn test -f backend/pom.xml
   cd frontend && npm run build
   ```
2. Commit your changes using conventional commit messages:
   * `feat: add new endpoint for reserve queue`
   * `fix: correct fine calculation rounding mode`
   * `docs: update API specification`
3. Push to your fork and submit a Pull Request targeting the `main` branch.
4. Complete the Pull Request template checklist.
