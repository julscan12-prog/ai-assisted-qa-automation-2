# DS-2 — Edit Existing Program Details (Jira Ticket Input)

## Feature

Edit existing program details

## Role

Senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Edit existing program details" feature.

## Feature Description

As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

## Acceptance Criteria

### Scenario: Open program for editing

```gherkin
Given I am on the Programs page
And a program "Web Development 2026" exists
When I click the edit icon on "Web Development 2026"
Then I see the edit form pre-populated with the program's current data
```

### Scenario: Successfully edit a program name

```gherkin
Given I am editing "Web Development 2026"
When I change the Name to "Web Development 2026 - Updated"
And I click Save
Then the modal closes
And the program list immediately shows "Web Development 2026 - Updated"
```

### Scenario: Edit preserves unchanged fields

```gherkin
Given I am editing a program
When I only change the Description
And I click Save
Then the Name and other fields remain unchanged
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
| Entry point | Edit icon on program row |
| Form type | Modal |
| Field 1 | Program Name |
| Field 2 | Description |
| Submit button | Save |
| Example program name | Web Development 2026 |
| Example description | Full-stack web development program |
| Required role | Admin |
