```markdown
# snapdom Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development conventions and workflows used in the `snapdom` JavaScript repository. It covers file naming, import/export styles, commit patterns, and testing approaches. By following these patterns, contributors can maintain consistency and quality across the codebase.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.js`, `userProfile.test.js`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```javascript
    import { helperFunction } from './utils/helperFunction';
    ```

### Export Style
- Use **named exports** for functions, objects, or components.
  - Example:
    ```javascript
    // In helperFunction.js
    export function helperFunction() { ... }
    ```

    ```javascript
    // Importing
    import { helperFunction } from './helperFunction';
    ```

### Commit Patterns
- Commit types are **mixed**, but often use the `fix` prefix for bug fixes.
- Keep commit messages concise (average 47 characters).
  - Example:
    ```
    fix: resolve issue with user authentication
    ```

## Workflows

### Code Contribution
**Trigger:** When adding new features or fixing bugs  
**Command:** `/contribute`

1. Create a new branch for your work.
2. Write code using camelCase file naming and relative imports.
3. Use named exports for all modules.
4. Write or update tests in files matching `*.test.js`.
5. Commit changes with a clear, concise message (use `fix:` prefix for bug fixes).
6. Open a pull request for review.

### Running Tests
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Locate test files (`*.test.js`).
2. Run the test suite using your preferred JavaScript test runner.
   - Example (if using Jest):
     ```
     npx jest
     ```
3. Ensure all tests pass before merging changes.

## Testing Patterns

- Test files are named with the pattern `*.test.js`.
  - Example: `userProfile.test.js`
- The specific testing framework is not detected; use the project's preferred runner.
- Place tests alongside the code or in a dedicated test directory.

  ```javascript
  // userProfile.test.js
  import { getUserProfile } from './userProfile';

  test('returns correct user data', () => {
    expect(getUserProfile(1)).toEqual({ id: 1, name: 'Alice' });
  });
  ```

## Commands
| Command        | Purpose                                 |
|----------------|-----------------------------------------|
| /contribute    | Start the code contribution workflow     |
| /run-tests     | Run all test suites in the repository   |
```