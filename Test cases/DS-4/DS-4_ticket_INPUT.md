# DS-4 — Delete Program with Confirmation (Jira Ticket Input)

## Feature

Delete program with confirmation

## Role

Senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Delete program with confirmation" feature.

## Feature Description

As an admin user, I want to delete a program I no longer need, with a confirmation step to prevent accidental deletion.

## Acceptance Criteria

### Scenario: Delete program with confirmation

```gherkin
Given a program "Test Program" exists
When I click the delete icon for "Test Program"
Then I see a confirmation dialog
When I confirm deletion
Then "Test Program" is removed from the program list
```

### Scenario: Cancel program deletion

```gherkin
Given I click the delete icon for a program
When I see the confirmation dialog
And I click Cancel
Then the program still exists in the list
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
| Entry point | Delete icon on program row |
| Dialog type | Confirmation dialog |
| Dismiss action | Cancel |
| Confirm action | Confirm deletion (button label TBD: Delete / Confirm) |
| Example program name | Test Program |
| Related fields (create/edit parity) | Program Name, Description |
| Program Name max length | 255 |
| Description max length | 1000 |
| Required role | Admin |
| App | Didaxis Studio (`/programs`) |
