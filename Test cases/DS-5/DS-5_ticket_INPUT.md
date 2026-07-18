# DS-5 — Program List Filtering and Display (Jira Ticket Input)

## Feature

Program list filtering and display

## Role

Senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the "Program list filtering and display" feature.

## Feature Description

As an admin user, I want to see all programs in a clear list so that I can quickly find and manage them.

## Acceptance Criteria

### Scenario: Display program list with key details

```gherkin
Given programs exist in the system
When I navigate to the Programs page
Then I see a list showing each program's name and description
```

### Scenario: Empty state when no programs exist

```gherkin
Given no programs exist
When I navigate to the Programs page
Then I see a message indicating no programs have been created
And I see a prompt to create the first program
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
| Page | Programs page (`/programs`) |
| List fields shown | Program Name, Description |
| Create entry point | "+ New Program" |
| Empty state | Message that no programs have been created + prompt to create the first program |
| Example program name | Web Development 2026 |
| Example description | Full-stack web development program |
| Program Name max length | 255 |
| Description max length | 1000 |
| Required role | Admin |
| App | Didaxis Studio |
| Note | Feature title mentions filtering; ACs currently cover display and empty state only |
