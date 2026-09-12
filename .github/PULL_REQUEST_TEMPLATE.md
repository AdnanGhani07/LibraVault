## Description
Provide a brief summary of the changes introduced by this pull request.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Performance improvement / Refactoring
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Architecture & Security Checklist
- [ ] Concurrency & Transactions: Verified transactional integrity and locking where appropriate.
- [ ] Role-Based Access Control: Verified `@PreAuthorize` security checks.
- [ ] Error Handling: Handled edge cases with standard RFC JSON error envelopes.
- [ ] Unit & Integration Tests: Added/updated automated tests.
- [ ] Backend Build: `mvn test -f backend/pom.xml` passes cleanly.
- [ ] Frontend Build: `npm run build` in `frontend/` succeeds with 0 errors.

## Screenshots / Demo (if applicable)
Add screenshots or terminal output demonstrating the working changes.
