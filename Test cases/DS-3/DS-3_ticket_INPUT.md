# DS-3 — Program Name Validation and Duplicate Prevention (Jira Ticket Input)

## Feature

Program name validation and duplicate prevention

## Role

Senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Program name validation and duplicate prevention" feature.

## Feature Description

As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

## Acceptance Criteria

### Scenario: Reject program name with only whitespace

```gherkin
Given I am on the program creation form
When I enter "   " as the program name
And I click Create
Then the form is not submitted (name is trimmed, treated as empty)
```

### Scenario: Accept program name with special characters

```gherkin
Given I am on the program creation form
When I enter "Informatique & IA - Niveau 2" as the program name
And I fill other required fields
And I click Create
Then the program is created successfully
```

### Scenario: Reject duplicate program name

```gherkin
Given a program "Web Development 2026" already exists
When I try to create a new program with the same name
Then I see an error indicating the name already exists
```

## Requirements for the Test Plan

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs don't mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case as:
  - ID (TC-001, TC-002, etc.)
  - Title (expected behavior, not action)
  - Preconditions
  - Steps (numbered)
  - Expected result
  - Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases

## Output Format

- Structured test plan in Markdown
- Use real field names and values, not placeholders
- At the end: list any ambiguities or gaps in the ACs

## Known Fields and UI Elements

| Element | Value / Label |
|---------|---------------|
| Page | Programs page |
| Entry point | "+ New Program" button |
| Form type | Modal |
| Field 1 | Program Name |
| Field 2 | Description |
| Submit button | Create |
| Example program name | Web Development 2026 |
| Example description | Full-stack web development program |
| Required role | Admin |
