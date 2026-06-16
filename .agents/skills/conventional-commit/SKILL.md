---
name: conventional-commit
description: 'Prompt and workflow for generating conventional commit messages using a structured format. Guides users to create standardized, descriptive commit messages in line with the Conventional Commits specification, including instructions, examples, and validation.'
---

### Instructions

This file contains a prompt template for generating conventional commit messages. It provides instructions, examples, and formatting guidelines to help users write standardized, descriptive commit messages in accordance with the Conventional Commits specification.

### Workflow

**Follow these steps:**

1. Run `git status` to review changed files.
2. Run `git diff` or `git diff --cached` to inspect changes.
3. Construct your commit message using the following structure.
4. Directly output the constructed commit message to the user. **Do not run or execute any `git commit` command in the terminal.**

### Commit Message Structure

The commit message should follow this format:

```text
type(scope): description

body

footer
```

- **Type**: Must be one of the following: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scope**: Optional, enclosed in parentheses, specifying the scope of the change.
- **Description**: A short summary of the change in Traditional Chinese (繁體中文).
- **Body**: Optional, a more detailed explanation of the change in Traditional Chinese (繁體中文). Separate from the header with a blank line.
- **Footer**: Optional, used for breaking changes or referencing issues, in Traditional Chinese (繁體中文). Separate from the body/header with a blank line.

### Examples

Here are some examples of valid commit messages:
- `feat(parser): 新增解析陣列的功能`
- `fix(ui): 修正按鈕對齊問題`
- `docs: 更新 README 使用說明`
- `refactor: 改善資料處理效能`
- `chore: 更新依賴套件`
- `feat!: 註冊時發送電子郵件 (BREAKING CHANGE: 需要電子郵件服務)`

### Validation

Please validate the generated commit message against these rules:
- **Language**: All text in the description, body, and footer must be written in Traditional Chinese (繁體中文). Only the type and scope must remain in English.
- **Type**: Must be one of the allowed types. See the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/#specification).
- **Scope**: Optional, but recommended for clarity.
- **Description**: Required. Write in Traditional Chinese (繁體中文).
- **Body**: Optional. Use for additional context, written in Traditional Chinese (繁體中文).
- **Footer**: Use for breaking changes or issue references, written in Traditional Chinese (繁體中文).

### Final Step

Directly return the formatted commit message to the user. Do not execute `git commit` or any other terminal commands.
