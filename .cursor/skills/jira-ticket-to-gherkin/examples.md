# Examples

## Trigger prompt

```
Create test scenarios for DS-4
```

The agent fetches **DS-4 — Delete Program with Confirmation** from Jira, reads the acceptance criteria, and writes `features/DS-4.feature`.

---

## Sample output: `features/DS-4.feature`

```gherkin
Feature: DS-4 — Delete program with confirmation

  As an admin user, I want to delete a program I no longer need,
  with a confirmation step to prevent accidental deletion.

  # Happy paths

  Scenario: Confirmation dialog appears when delete icon is clicked
    Given I am logged in as admin
    And I am on the Programs page at "/programs"
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    And the program list still shows "Test Program"

  Scenario: Delete program with confirmation
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Cancel program deletion
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I click Cancel
    Then the program still exists in the list

  Scenario: Deleting one program does not remove others
    Given programs "Test Program", "Web Development 2026", and "Data Science Fundamentals" exist
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then the program list does not show "Test Program"
    And the program list still shows "Web Development 2026"
    And the program list still shows "Data Science Fundamentals"

  # Negative

  Scenario: Dismissing confirmation without confirm does not delete
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I dismiss the confirmation dialog without confirming
    Then "Test Program" still exists in the program list

  Scenario: Delete does not execute while confirmation is pending
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I do not confirm or cancel
    Then I still see the confirmation dialog
    And the program list still shows "Test Program"

  Scenario: Non-admin cannot delete a program
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Test Program" exists
    Then I do not see an actionable delete icon for "Test Program"

  Scenario: Unauthenticated user cannot delete programs
    Given I am not logged in
    When I attempt to navigate to the Programs page
    Then I am redirected to the login page

  # Edge cases

  Scenario: Delete program that has empty Description
    Given a program "Minimal Program" exists with an empty Description
    When I click the delete icon for "Minimal Program"
    And I confirm deletion
    Then "Minimal Program" is removed from the program list

  Scenario: Deleted program name becomes available again
    Given a program "Test Program" exists
    When I delete "Test Program" with confirmation
    And I create a new program with Program Name "Test Program"
    Then the program is created successfully
    And the program list shows "Test Program"

  Scenario: Double confirm does not break delete flow
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion twice in rapid succession
    Then "Test Program" is removed from the program list
    And no error is displayed

  #
  # Ambiguities and gaps in acceptance criteria
  #
  # - Confirm button label is TBD (Delete vs Confirm) — scenarios assume a generic "confirm deletion" action.
  # - AC does not specify how to dismiss the dialog (Cancel, X, Escape, click outside) — only Cancel is covered in AC.
  # - AC does not define behavior for non-admin or unauthenticated users.
  # - AC does not address programs with max-length names (255 chars) or special characters in names.
  # - AC does not specify whether deleted programs can be recreated with the same name.
```
