# DS-4 — Delete Program with Confirmation (Test Plan Output)

**Feature:** Delete program with confirmation  
**Scope:** Admin user — Programs page → delete icon → confirmation dialog  
**App:** Didaxis Studio (`/programs`)  
**Source:** DS-4_ticket_INPUT

---

## Positive Flows

---

### TC-001 — Confirmation dialog appears when delete icon is clicked

**Preconditions:** User is logged in as admin; program **Test Program** exists on the Programs page  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate the row for **Test Program**.
3. Click the delete icon for **Test Program**.

**Expected result:** A confirmation dialog is visible. **Test Program** is still present in the list (not deleted yet).

**Gherkin:**
```gherkin
Scenario: Delete program with confirmation — dialog opens
  Given a program "Test Program" exists
  And I am logged in as admin
  And I am on the Programs page
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  And the program list still shows "Test Program"
```

---

### TC-002 — Confirmed deletion removes the program from the list

**Preconditions:** User is logged in as admin; program **Test Program** exists; confirmation dialog is open for **Test Program**  
**Priority:** High

**Steps:**
1. On the Programs page, click the delete icon for **Test Program**.
2. In the confirmation dialog, click the confirm/delete action (e.g. **Delete** / **Confirm**).

**Expected result:** The confirmation dialog closes. **Test Program** is no longer visible in the program list.

**Gherkin:**
```gherkin
Scenario: Delete program with confirmation
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list
```

---

### TC-003 — Cancel keeps the program in the list

**Preconditions:** User is logged in as admin; program **Test Program** exists  
**Priority:** High

**Steps:**
1. Click the delete icon for **Test Program**.
2. Verify the confirmation dialog is visible.
3. Click **Cancel**.

**Expected result:** The dialog closes. **Test Program** remains in the program list unchanged.

**Gherkin:**
```gherkin
Scenario: Cancel program deletion
  Given I click the delete icon for a program
  When I see the confirmation dialog
  And I click Cancel
  Then the program still exists in the list
```

---

### TC-004 — Only the selected program is removed when multiple programs exist

**Preconditions:** Programs **Test Program**, **Web Development 2026**, and **Data Science Fundamentals** all exist  
**Priority:** High

**Steps:**
1. Click the delete icon for **Test Program**.
2. Confirm deletion in the dialog.

**Expected result:** **Test Program** is removed. **Web Development 2026** and **Data Science Fundamentals** remain visible and unchanged.

**Gherkin:**
```gherkin
Scenario: Deleting one program does not remove others
  Given programs "Test Program", "Web Development 2026", and "Data Science Fundamentals" exist
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then the program list does not show "Test Program"
  And the program list still shows "Web Development 2026"
  And the program list still shows "Data Science Fundamentals"
```

---

### TC-005 — Program with empty Description can be deleted

**Preconditions:** Program **Minimal Program** exists with **Program Name** = `Minimal Program` and empty **Description**  
**Priority:** Medium

**Steps:**
1. Click the delete icon for **Minimal Program**.
2. Confirm deletion.

**Expected result:** **Minimal Program** is removed from the list. No error related to empty **Description**.

**Gherkin:**
```gherkin
Scenario: Delete program that has empty Description
  Given a program "Minimal Program" exists with an empty Description
  When I click the delete icon for "Minimal Program"
  And I confirm deletion
  Then "Minimal Program" is removed from the program list
```

---

### TC-006 — Deleted program name can be reused for a new program

**Preconditions:** Program **Test Program** exists  
**Priority:** Medium

**Steps:**
1. Delete **Test Program** with confirmation.
2. Click **+ New Program**.
3. Enter `Test Program` in **Program Name**.
4. Enter `Recreated after delete` in **Description**.
5. Click **Create**.

**Expected result:** Creation succeeds. **Test Program** appears again in the list (no “already exists” error).

**Gherkin:**
```gherkin
Scenario: Deleted program name becomes available again
  Given a program "Test Program" exists
  When I delete "Test Program" with confirmation
  And I create a new program with Program Name "Test Program"
  Then the program is created successfully
  And the program list shows "Test Program"
```

---

## Negative Flows

---

### TC-007 — Closing the dialog without confirming does not delete the program

**Preconditions:** Program **Test Program** exists; confirmation dialog is open  
**Priority:** High

**Steps:**
1. Click the delete icon for **Test Program**.
2. Dismiss the dialog without confirming (e.g. **Cancel**, **X**, Escape, or click outside — per product behavior).

**Expected result:** Dialog closes. **Test Program** remains in the list. No delete API success / no removal.

**Gherkin:**
```gherkin
Scenario: Dismissing confirmation without confirm does not delete
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I dismiss the confirmation dialog without confirming
  Then "Test Program" still exists in the program list
```

---

### TC-008 — Program is not deleted until confirmation is explicitly given

**Preconditions:** Program **Test Program** exists  
**Priority:** High

**Steps:**
1. Click the delete icon for **Test Program**.
2. Leave the confirmation dialog open (do not click confirm or **Cancel**).
3. Observe the program list.

**Expected result:** Confirmation dialog remains open. **Test Program** is still in the list. No background deletion occurs.

**Gherkin:**
```gherkin
Scenario: Delete does not execute while confirmation is pending
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I do not confirm or cancel
  Then I still see the confirmation dialog
  And the program list still shows "Test Program"
```

---

### TC-009 — Non-admin users cannot delete programs

**Preconditions:** User is logged in as a non-admin role; program **Test Program** exists  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate **Test Program**.
3. Attempt to use the delete control.

**Expected result:** Delete icon is hidden/disabled, or access is denied. **Test Program** is not deleted.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot delete a program
  Given I am logged in as a non-admin user
  And I am on the Programs page
  And a program "Test Program" exists
  Then I do not see an actionable delete icon for "Test Program"
  And I cannot delete "Test Program"
```

---

### TC-010 — Unauthenticated users cannot delete programs

**Preconditions:** User is not logged in  
**Priority:** High

**Steps:**
1. Attempt to open the **Programs** page or invoke a delete endpoint/URL for a program.

**Expected result:** Redirect to login or unauthorized response. No program is deleted.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot delete programs
  Given I am not logged in
  When I attempt to navigate to the Programs page
  Then I am redirected to the login page
  And I cannot delete any program
```

---

### TC-011 — Double-click confirm does not cause errors or duplicate delete calls to break the UI

**Preconditions:** Program **Test Program** exists; confirmation dialog is open  
**Priority:** Medium

**Steps:**
1. Click the delete icon for **Test Program**.
2. Rapidly click the confirm/delete action twice.

**Expected result:** **Test Program** is removed once. No unhandled error, duplicate toast spam, or broken list state. Dialog does not stay stuck open.

**Gherkin:**
```gherkin
Scenario: Double confirm does not break delete flow
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I confirm deletion twice in rapid succession
  Then "Test Program" is removed from the program list
  And the UI remains usable with no error dialog
```

---

### TC-012 — Delete failure keeps the program and surfaces an error

**Preconditions:** Program **Test Program** exists; delete API is forced to fail (network error / 5xx)  
**Priority:** Medium

**Steps:**
1. Click the delete icon for **Test Program**.
2. Confirm deletion.
3. Observe UI after the failed request.

**Expected result:** **Test Program** remains in the list. User sees a clear error (toast/alert). Confirmation dialog closes or returns to a recoverable state.

**Gherkin:**
```gherkin
Scenario: Failed delete does not remove the program
  Given a program "Test Program" exists
  And the delete request will fail
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then I see an error message
  And the program list still shows "Test Program"
```

---

### TC-013 — Confirming delete does not open the edit form

**Preconditions:** Program **Test Program** exists  
**Priority:** Medium

**Steps:**
1. Click the delete icon for **Test Program** (not the edit control).
2. Confirm deletion.

**Expected result:** Edit form/modal for **Test Program** does not open. Only the delete confirmation flow runs, then the program is removed.

**Gherkin:**
```gherkin
Scenario: Delete action does not trigger edit
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then I do not see the Edit Program form
  And "Test Program" is removed from the program list
```

---

## Edge Cases

---

### TC-014 — Program with special characters in Program Name can be deleted

**Preconditions:** Program named `QA <Test> & "Prog" '2026'` exists  
**Priority:** Medium

**Steps:**
1. Locate `QA <Test> & "Prog" '2026'` in the list.
2. Click its delete icon.
3. Confirm deletion.

**Expected result:** Confirmation dialog opens (name displayed correctly/safely). After confirm, that program is removed. No XSS execution or broken markup in the dialog.

**Gherkin:**
```gherkin
Scenario: Delete program whose name contains special characters
  Given a program "QA <Test> & \"Prog\" '2026'" exists
  When I click the delete icon for that program
  And I confirm deletion
  Then that program is removed from the program list
  And no script or broken markup appears in the confirmation dialog
```

---

### TC-015 — Program with maximum-length Program Name (255) can be deleted

**Preconditions:** A program exists whose **Program Name** is exactly 255 characters (e.g. 255× `x`)  
**Priority:** Medium

**Steps:**
1. Locate the 255-character program in the list.
2. Click delete icon → confirm.

**Expected result:** Dialog opens and deletion succeeds. Program no longer appears in the list. UI does not overflow/clip in a way that blocks the delete or confirm controls.

**Gherkin:**
```gherkin
Scenario: Delete program with max-length Program Name
  Given a program exists with Program Name of 255 characters
  When I click the delete icon for that program
  And I confirm deletion
  Then that program is removed from the program list
```

---

### TC-016 — Program with maximum-length Description (1000) can be deleted

**Preconditions:** Program **Long Description Program** exists with **Description** of 1000 characters  
**Priority:** Low

**Steps:**
1. Click the delete icon for **Long Description Program**.
2. Confirm deletion.

**Expected result:** Program is removed successfully regardless of description length.

**Gherkin:**
```gherkin
Scenario: Delete program with max-length Description
  Given a program "Long Description Program" exists with a 1000-character Description
  When I click the delete icon for "Long Description Program"
  And I confirm deletion
  Then "Long Description Program" is removed from the program list
```

---

### TC-017 — Program with Unicode / accented characters can be deleted

**Preconditions:** Program **Développement Web 日本語** exists  
**Priority:** Medium

**Steps:**
1. Click the delete icon for **Développement Web 日本語**.
2. Confirm deletion.

**Expected result:** Dialog shows the correct name. Program is removed from the list.

**Gherkin:**
```gherkin
Scenario: Delete program with Unicode Program Name
  Given a program "Développement Web 日本語" exists
  When I click the delete icon for "Développement Web 日本語"
  And I confirm deletion
  Then "Développement Web 日本語" is removed from the program list
```

---

### TC-018 — Deleting the last remaining program leaves an empty list state

**Preconditions:** Only one program exists: **Test Program**  
**Priority:** Medium

**Steps:**
1. Delete **Test Program** with confirmation.
2. Observe the Programs page.

**Expected result:** List no longer shows **Test Program**. Empty state is shown (or an empty table) and **+ New Program** remains available. No broken layout or residual row for the deleted program.

**Gherkin:**
```gherkin
Scenario: Delete last program shows empty list state
  Given the only program in the list is "Test Program"
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then the program list does not show "Test Program"
  And I can still click "+ New Program"
```

---

### TC-019 — Confirmation dialog identifies the correct program when names are similar

**Preconditions:** Programs **Test Program** and **Test Program 2** both exist  
**Priority:** High

**Steps:**
1. Click the delete icon for **Test Program** (not **Test Program 2**).
2. Read the confirmation dialog content.
3. Click **Cancel**.
4. Click the delete icon for **Test Program 2**.
5. Confirm deletion.

**Expected result:** First dialog refers to **Test Program** only; after cancel both still exist. After confirming for **Test Program 2**, only **Test Program 2** is removed; **Test Program** remains.

**Gherkin:**
```gherkin
Scenario: Confirmation targets the selected program among similar names
  Given programs "Test Program" and "Test Program 2" exist
  When I click the delete icon for "Test Program"
  Then the confirmation dialog refers to "Test Program"
  When I click Cancel
  And I click the delete icon for "Test Program 2"
  And I confirm deletion
  Then the program list does not show "Test Program 2"
  And the program list still shows "Test Program"
```

---

### TC-020 — Leading/trailing spaces in Program Name do not block delete

**Preconditions:** A program was created/stored with a name that includes leading/trailing spaces if the product allows it (e.g. display/storage of `  Spaced Program  `); otherwise use the trimmed displayed name  
**Priority:** Low

**Steps:**
1. Locate the program in the list by its displayed name.
2. Click delete → confirm.

**Expected result:** Delete targets the correct row. Program is removed. No mismatch between displayed name and delete action.

**Gherkin:**
```gherkin
Scenario: Delete works for Program Name with surrounding whitespace
  Given a program whose displayed name is "  Spaced Program  " or the trimmed equivalent exists
  When I click the delete icon for that program
  And I confirm deletion
  Then that program is removed from the program list
```

---

### TC-021 — Keyboard: Escape cancels deletion (if supported)

**Preconditions:** Confirmation dialog is open for **Test Program**  
**Priority:** Low

**Steps:**
1. Click the delete icon for **Test Program**.
2. Press **Escape**.

**Expected result:** Dialog closes (if Escape is supported). **Test Program** remains in the list.

**Gherkin:**
```gherkin
Scenario: Escape dismisses delete confirmation without deleting
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I press Escape
  Then the confirmation dialog is closed
  And "Test Program" still exists in the program list
```

---

### TC-022 — Dashboard Programs count updates after deletion (if count is shown)

**Preconditions:** Admin can see Programs count on Dashboard (e.g. Programs tile); program **Test Program** exists  
**Priority:** Low

**Steps:**
1. Note the Programs count on the Dashboard.
2. Delete **Test Program** with confirmation from the Programs page.
3. Return to the Dashboard.

**Expected result:** Programs count decreases by 1 (or refreshes to the new total). Count does not stay stale indefinitely.

**Gherkin:**
```gherkin
Scenario: Dashboard program count reflects deletion
  Given a program "Test Program" exists
  And I note the Programs count on the Dashboard
  When I delete "Test Program" with confirmation
  And I open the Dashboard
  Then the Programs count is updated to reflect one fewer program
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| Delete icon opens confirmation dialog | TC-001 |
| Confirm deletion removes program from list | TC-002, TC-004, TC-005 |
| Cancel keeps program in the list | TC-003, TC-007 |
| *(Extended: permissions, errors, edge names)* | TC-006, TC-008–TC-022 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Confirm button label** — AC says “confirm deletion” but does not specify the button text (**Delete**, **Confirm**, **Yes**, etc.).
2. **Dialog copy** — No requirement that the dialog shows the program name, a warning about permanence, or linked data impact.
3. **Delete control UX** — “Delete icon” only; aria-label (e.g. `Delete Test Program`), tooltip, keyboard access, and hover-only visibility are undefined.
4. **Other dismiss paths** — Only **Cancel** is specified; **X**, Escape, and click-outside behavior are not defined.
5. **Success feedback** — No mention of toast, snackbar, or silent list refresh after delete.
6. **Hard vs soft delete** — Unclear whether delete is permanent, recoverable, or archival.
7. **Downstream impact** — No AC for programs with courses, sessions, calendar data, enrollments, or exports; blocked delete vs cascade vs orphan data is unspecified.
8. **Permissions** — Only “admin user” in the story; non-admin and unauthenticated behavior not defined.
9. **Concurrency** — Two admins deleting the same program, or delete while another user edits it, is not covered.
10. **List UX after delete** — Pagination, search/filter, sort order, and empty-state messaging are not specified.
11. **Error handling** — Network/API failure and double-submit are not in the ACs.
12. **Name reuse after delete** — Whether the deleted **Program Name** can be created again is not stated (assumed allowed in TC-006).
13. **Audit / history** — No requirement for delete logging or “deleted by/at” metadata.
