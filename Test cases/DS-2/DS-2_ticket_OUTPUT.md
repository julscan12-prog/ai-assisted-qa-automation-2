# DS-2 — Edit Existing Program Details (Test Plan Output)

**Feature:** Edit existing program details  
**Scope:** Admin user — Programs page → edit icon → edit form  
**Source:** DS-2_ticket_INPUT

---

## Positive Flows

---

### TC-001 — Edit form opens pre-populated with the program's current data

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists with Description **Full-stack web development program**  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate **Web Development 2026** in the program list.
3. Click the **edit icon** on **Web Development 2026**.

**Expected result:** The edit modal opens. **Program Name** shows `Web Development 2026`. **Description** shows `Full-stack web development program`.

**Gherkin:**
```gherkin
Scenario: Open program for editing
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Web Development 2026" exists with Description "Full-stack web development program"
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with Program Name "Web Development 2026"
  And I see Description "Full-stack web development program"
```

---

### TC-002 — Valid Program Name change is saved and reflected in the list

**Preconditions:** User is logged in as admin; **Web Development 2026** exists; user has opened the edit form for that program  
**Priority:** High

**Steps:**
1. Change **Program Name** to `Web Development 2026 - Updated`.
2. Click **Save**.

**Expected result:** Modal closes. Programs list shows **Web Development 2026 - Updated** (and no longer shows **Web Development 2026**).

**Gherkin:**
```gherkin
Scenario: Successfully edit a program name
  Given I am logged in as admin
  And I am editing "Web Development 2026"
  When I change Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
  And the program list does not show "Web Development 2026"
```

---

### TC-003 — Saving after changing only Description leaves Program Name unchanged

**Preconditions:** User is logged in as admin; program **Web Development 2026** exists with Description **Full-stack web development program**  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Description** to `Updated full-stack curriculum for 2026`.
3. Leave **Program Name** unchanged.
4. Click **Save**.

**Expected result:** Modal closes. List still shows **Web Development 2026**. Description is updated to **Updated full-stack curriculum for 2026**.

**Gherkin:**
```gherkin
Scenario: Edit preserves unchanged fields
  Given I am logged in as admin
  And I am editing "Web Development 2026" with Description "Full-stack web development program"
  When I change Description to "Updated full-stack curriculum for 2026"
  And I leave Program Name as "Web Development 2026"
  And I click Save
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program description is "Updated full-stack curriculum for 2026"
```

---

### TC-004 — Both Program Name and Description can be updated in one save

**Preconditions:** User is logged in as admin; program **Data Science Fundamentals** exists with Description **Introductory data science track**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Data Science Fundamentals**.
2. Change **Program Name** to `Data Science Fundamentals - Advanced`.
3. Change **Description** to `Advanced statistics and machine learning track`.
4. Click **Save**.

**Expected result:** Modal closes. List shows **Data Science Fundamentals - Advanced** with the new description.

**Gherkin:**
```gherkin
Scenario: Edit both Program Name and Description in one save
  Given I am logged in as admin
  And I am editing "Data Science Fundamentals" with Description "Introductory data science track"
  When I change Program Name to "Data Science Fundamentals - Advanced"
  And I change Description to "Advanced statistics and machine learning track"
  And I click Save
  Then the modal closes
  And the program list shows "Data Science Fundamentals - Advanced"
  And the program description is "Advanced statistics and machine learning track"
```

---

### TC-005 — Description can be cleared when Program Name remains valid

**Preconditions:** User is logged in as admin; program **Cybersecurity 2026** exists with a non-empty Description  
**Priority:** Medium

**Steps:**
1. Open edit form for **Cybersecurity 2026**.
2. Clear **Description** completely.
3. Leave **Program Name** as `Cybersecurity 2026`.
4. Click **Save**.

**Expected result:** Modal closes. **Cybersecurity 2026** remains in the list with an empty Description (or no description shown, per UI rules).

**Gherkin:**
```gherkin
Scenario: Description can be cleared during edit
  Given I am logged in as admin
  And I am editing "Cybersecurity 2026" with Description "Security fundamentals and labs"
  When I clear the Description field
  And I click Save
  Then the modal closes
  And the program list shows "Cybersecurity 2026"
  And the program has no description
```

---

### TC-006 — Save button is enabled when valid changes are made

**Preconditions:** User is editing **Web Development 2026** with a valid **Program Name**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Observe **Save** button state with no changes (if applicable).
3. Change **Description** to `Minor wording update`.
4. Observe **Save** button state.

**Expected result:** **Save** is enabled once a valid change is present (or remains enabled per product rules). Save succeeds when clicked.

**Gherkin:**
```gherkin
Scenario: Save button enables when valid edit is made
  Given I am editing "Web Development 2026"
  When I change Description to "Minor wording update"
  Then the Save button is enabled
  When I click Save
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-007 — Dismissing the edit form without saving leaves program data unchanged

**Preconditions:** User is editing **Web Development 2026** with original Description **Full-stack web development program**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Should Not Be Saved`.
3. Close the modal without clicking **Save** (Cancel, X, Escape, or click outside — per product convention).
4. Review the Programs list.

**Expected result:** Modal closes. List still shows **Web Development 2026** with original description. **Should Not Be Saved** does not appear.

**Gherkin:**
```gherkin
Scenario: Dismiss edit form without saving preserves original data
  Given I am logged in as admin
  And I am editing "Web Development 2026" with Description "Full-stack web development program"
  When I change Program Name to "Should Not Be Saved"
  And I dismiss the edit form without clicking Save
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program list does not show "Should Not Be Saved"
```

---

### TC-008 — Saving with no field changes does not corrupt program data

**Preconditions:** User is editing **Web Development 2026** with Description **Full-stack web development program**  
**Priority:** Low

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Do not modify any field.
3. Click **Save** (if enabled) or observe that **Save** is disabled.

**Expected result:** Program data remains **Web Development 2026** / **Full-stack web development program**. No duplicate row, no data loss, no erroneous error.

**Gherkin:**
```gherkin
Scenario: Save with no changes keeps program data intact
  Given I am editing "Web Development 2026" with Description "Full-stack web development program"
  When I click Save without changing any field
  Then the program list still shows "Web Development 2026"
  And the program description remains "Full-stack web development program"
```

---

## Negative Flows

---

### TC-009 — Empty Program Name prevents save

**Preconditions:** User is editing **Web Development 2026**  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Clear **Program Name** completely.
3. Attempt to click **Save**.

**Expected result:** **Save** is disabled or validation blocks submit. Program **Web Development 2026** remains unchanged in the list.

**Gherkin:**
```gherkin
Scenario: Empty Program Name prevents save on edit
  Given I am editing "Web Development 2026"
  When I clear the Program Name field
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-010 — Whitespace-only Program Name is rejected on save

**Preconditions:** User is editing **Web Development 2026**  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Replace **Program Name** with `   ` (spaces only).
3. Attempt to click **Save**.

**Expected result:** **Save** stays disabled or trim validation blocks submit. Original name **Web Development 2026** is preserved.

**Gherkin:**
```gherkin
Scenario: Whitespace-only Program Name is rejected on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "   "
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-011 — Non-admin users cannot edit program details

**Preconditions:** User is logged in as a non-admin role (e.g. instructor, student); **Web Development 2026** exists  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Locate **Web Development 2026**.
3. Attempt to use the edit control.

**Expected result:** Edit icon is hidden or disabled, or access is denied. Edit form is not usable.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot edit a program
  Given I am logged in as a non-admin user
  And I am on the Programs page
  And a program "Web Development 2026" exists
  Then I do not see an actionable edit icon for "Web Development 2026"
  And I cannot open the program edit form
```

---

### TC-012 — Unauthenticated users are blocked from editing programs

**Preconditions:** User is not logged in  
**Priority:** High

**Steps:**
1. Attempt to navigate to the **Programs** page or a direct edit URL (if known).

**Expected result:** User is redirected to login or receives unauthorized response. Edit form is not available.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot edit programs
  Given I am not logged in
  When I attempt to navigate to the Programs page
  Then I am redirected to the login page
  And I do not see the program edit form
```

---

### TC-013 — Renaming a program to an existing program name is rejected

**Preconditions:** Programs **Web Development 2026** and **Mobile Development 2026** both exist  
**Priority:** High

**Steps:**
1. Open edit form for **Mobile Development 2026**.
2. Change **Program Name** to `Web Development 2026`.
3. Click **Save**.

**Expected result:** Save fails with a clear error (e.g. "Program name already exists"). Modal stays open or error toast shown. List still has exactly one **Web Development 2026** and **Mobile Development 2026** unchanged.

**Gherkin:**
```gherkin
Scenario: Duplicate program name on edit is not allowed
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And the program list shows "Mobile Development 2026"
  And I am editing "Mobile Development 2026"
  When I change Program Name to "Web Development 2026"
  And I click Save
  Then the program is not renamed
  And I see an error indicating the program name already exists
  And the program list shows "Mobile Development 2026"
  And the program list contains only one "Web Development 2026"
```

---

### TC-014 — Renaming a program to its own current name does not create a duplicate

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Leave **Program Name** as `Web Development 2026`.
3. Change **Description** to `Description-only update`.
4. Click **Save**.

**Expected result:** Save succeeds. List contains exactly one **Web Development 2026**. No duplicate-name error for self-match.

**Gherkin:**
```gherkin
Scenario: Editing without renaming does not trigger duplicate-name error
  Given I am editing "Web Development 2026"
  When I leave Program Name as "Web Development 2026"
  And I change Description to "Description-only update"
  And I click Save
  Then the modal closes
  And the program list contains exactly one "Web Development 2026"
```

---

### TC-015 — Repeated Save clicks do not create duplicate programs or corrupt data

**Preconditions:** User is editing **Web Development 2026**  
**Priority:** Medium

**Steps:**
1. Change **Program Name** to `Web Development 2026 - Revised`.
2. Click **Save** twice in quick succession.

**Expected result:** Exactly one program **Web Development 2026 - Revised** exists. No duplicate rows or partial saves.

**Gherkin:**
```gherkin
Scenario: Double Save on edit does not corrupt program data
  Given I am editing "Web Development 2026"
  When I change Program Name to "Web Development 2026 - Revised"
  And I click Save twice in quick succession
  Then the modal closes
  And the program list shows exactly one "Web Development 2026 - Revised"
```

---

### TC-016 — Failed save shows error and does not falsely update the list

**Preconditions:** Simulate or trigger API failure (500, network offline) during save  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Network Failure Test`.
3. Click **Save** while backend is unavailable.

**Expected result:** Error message is shown. List still shows **Web Development 2026**. Entered values remain in the form if modal stays open.

**Gherkin:**
```gherkin
Scenario: API failure during edit shows error
  Given I am editing "Web Development 2026"
  And the update program API will fail
  When I change Program Name to "Network Failure Test"
  And I click Save
  Then I see an error message that the program could not be updated
  And the program list still shows "Web Development 2026"
  And the program list does not show "Network Failure Test"
```

---

## Edge Cases

---

### TC-017 — Single-character Program Name is accepted on edit

**Preconditions:** Program **QA Boundary Test Program** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **QA Boundary Test Program**.
2. Change **Program Name** to `A`.
3. Click **Save**.

**Expected result:** List shows **A** (unless product defines a higher minimum length).

**Gherkin:**
```gherkin
Scenario: Minimum length Program Name is accepted on edit
  Given I am editing "QA Boundary Test Program"
  When I change Program Name to "A"
  And I click Save
  Then the modal closes
  And the program list shows "A"
```

---

### TC-018 — Program Name at max length is saved correctly on edit

**Preconditions:** Max length for **Program Name** is 255 characters; program **Max Length Source Program** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Max Length Source Program**.
2. Change **Program Name** to a string of exactly 255 characters (e.g. 255 × `x`).
3. Click **Save**.

**Expected result:** Program is updated with the full 255-character name. No silent truncation without indication.

**Gherkin:**
```gherkin
Scenario: Program Name at maximum length is accepted on edit
  Given I am editing "Max Length Source Program"
  And the maximum Program Name length is 255 characters
  When I change Program Name to a 255-character string
  And I click Save
  Then the modal closes
  And the program list shows the program with the full 255-character name
```

---

### TC-019 — Over-max Program Name cannot be saved on edit

**Preconditions:** Max length for **Program Name** is 255 characters; user is editing **Web Development 2026**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Enter 256 characters in **Program Name**.
3. Attempt to click **Save**.

**Expected result:** Input is prevented or validation error shown; **Save** disabled or submit rejected. Original program unchanged.

**Gherkin:**
```gherkin
Scenario: Program Name over maximum length is rejected on edit
  Given I am editing "Web Development 2026"
  And the maximum Program Name length is 255 characters
  When I change Program Name to a 256-character string
  Then the Save button is disabled or I see a validation error
  And the program list still shows "Web Development 2026"
```

---

### TC-020 — Description at max length is saved correctly on edit

**Preconditions:** Max length for **Description** is 1000 characters; program **Web Development 2026** exists  
**Priority:** Low

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Description** to a 1000-character string.
3. Click **Save**.

**Expected result:** Description is stored and displayed per UI rules.

**Gherkin:**
```gherkin
Scenario: Description at maximum length is accepted on edit
  Given I am editing "Web Development 2026"
  And the maximum Description length is 1000 characters
  When I change Description to a 1000-character string
  And I click Save
  Then the modal closes
  And the program description is stored with the full 1000-character text
```

---

### TC-021 — Program Name with special characters is saved correctly on edit

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Web Dev & Design (2026) – Cohort #1`.
3. Click **Save**.

**Expected result:** List displays the exact name with correct encoding.

**Gherkin:**
```gherkin
Scenario: Program Name with special characters is accepted on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "Web Dev & Design (2026) – Cohort #1"
  And I click Save
  Then the modal closes
  And the program list shows "Web Dev & Design (2026) – Cohort #1"
```

---

### TC-022 — Unicode and emoji in fields are preserved on edit

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Low

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `Програма розробки 🎓 2026`.
3. Change **Description** to `Опис програми — full-stack 🚀`.
4. Click **Save**.

**Expected result:** List shows correct Unicode/emoji without corruption (no mojibake).

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in fields are preserved on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "Програма розробки 🎓 2026"
  And I change Description to "Опис програми — full-stack 🚀"
  And I click Save
  Then the modal closes
  And the program list shows "Програма розробки 🎓 2026"
```

---

### TC-023 — Leading and trailing spaces in Program Name are trimmed on save

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `  Mobile Development 2026  `.
3. Click **Save**.

**Expected result:** List shows **Mobile Development 2026** (trimmed), not the padded version.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces in Program Name are trimmed on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "  Mobile Development 2026  "
  And I click Save
  Then the modal closes
  And the program list shows "Mobile Development 2026"
  And the program list does not show "  Mobile Development 2026  "
```

---

### TC-024 — Case-variant duplicate name policy is applied consistently on edit

**Preconditions:** Program **Web Development 2026** exists; user is editing **Mobile Development 2026**  
**Priority:** Medium

**Steps:**
1. Open edit form for **Mobile Development 2026**.
2. Change **Program Name** to `web development 2026`.
3. Click **Save**.

**Expected result:** Behavior matches product rule: either rejected as duplicate or allowed as distinct — documented and consistent with create flow.

**Gherkin:**
```gherkin
Scenario: Case-variant program name duplicate policy on edit
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am editing "Mobile Development 2026"
  When I change Program Name to "web development 2026"
  And I click Save
  Then the system applies the defined duplicate-name policy consistently
```

---

### TC-025 — HTML and script content in fields is safely handled on edit

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** High

**Steps:**
1. Open edit form for **Web Development 2026**.
2. Change **Program Name** to `<script>alert('xss')</script>`.
3. Change **Description** to `<img src=x onerror=alert(1)>`.
4. Click **Save**.
5. View the program in the list.

**Expected result:** No script execution. Values are escaped or sanitized; UI remains stable.

**Gherkin:**
```gherkin
Scenario: HTML and script content in fields is safely handled on edit
  Given I am editing "Web Development 2026"
  When I change Program Name to "<script>alert('xss')</script>"
  And I change Description to "<img src=x onerror=alert(1)>"
  And I click Save
  Then no script is executed in the browser
  And the program list displays the values safely without breaking the page
```

---

### TC-026 — Edit succeeds when Description is empty and Program Name is long

**Preconditions:** Program **Long Name Source Program** exists with a short Description  
**Priority:** Low

**Steps:**
1. Open edit form for **Long Name Source Program**.
2. Change **Program Name** to a 200-character string.
3. Clear **Description**.
4. Click **Save**.

**Expected result:** Program updated successfully; long name displays correctly in the list.

**Gherkin:**
```gherkin
Scenario: Long Program Name with empty Description succeeds on edit
  Given I am editing "Long Name Source Program"
  When I change Program Name to a 200-character string
  And I clear the Description field
  And I click Save
  Then the modal closes
  And the program list shows the program with the 200-character name
```

---

### TC-027 — Program with empty Description opens edit form with empty Description field

**Preconditions:** Program **Minimal Program** exists with no Description  
**Priority:** Medium

**Steps:**
1. Navigate to **Programs** page.
2. Click edit icon on **Minimal Program**.

**Expected result:** Edit form opens with **Program Name** = `Minimal Program` and **Description** empty (not stale data from another program).

**Gherkin:**
```gherkin
Scenario: Edit form correctly pre-populates empty Description
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Minimal Program" exists with no description
  When I click the edit icon on "Minimal Program"
  Then I see Program Name "Minimal Program"
  And the Description field is empty
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| Open program for editing; form pre-populated | TC-001, TC-027 |
| Successfully edit program name | TC-002 |
| Edit preserves unchanged fields | TC-003, TC-014 |
| *(Extended coverage)* | TC-004–TC-026 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Updated name spelling inconsistency** — The *When* step uses `"Web Development 2026 - Updated"` (space around hyphen) but the original *Then* step showed `"Web Development 2026-Updated"` (no space). Expected display format should be confirmed.

2. **Form fields not fully specified** — AC implies **Program Name** and **Description** (from create feature parity) but does not explicitly list field labels on the edit form or modal title (e.g. "Edit Program").

3. **Edit control UX** — AC says "edit icon" only; tooltip, aria-label, keyboard access, and row-click behavior are undefined.

4. **Description required or optional on edit?** — AC covers name validation on create but not whether **Description** can be cleared during edit (TC-005 assumes optional, matching create).

5. **Save button behavior** — No AC for disabled **Save** when **Program Name** is empty, when there are no changes, or during in-flight save.

6. **Dismiss / cancel behavior** — No AC for Cancel, X, Escape, or click-outside; unsaved changes handling is unspecified (TC-007).

7. **Max length limits** — No limits stated for **Program Name** or **Description** (TC-018–TC-020 assume 255 / 1000 pending confirmation).

8. **Duplicate names on rename** — Not mentioned; policy for case sensitivity and trimming is undefined (TC-013, TC-024).

9. **List update behavior** — AC says list updates "immediately" but sort order, search/filter refresh, pagination, and success toast are not specified.

10. **Permissions** — Only admin in positive flows; non-admin and unauthenticated access not defined (TC-011, TC-012).

11. **Error handling** — Network/API failures and double-submit not covered (TC-015, TC-016).

12. **Security / i18n** — XSS sanitization and Unicode handling not in ACs (TC-022, TC-025).

13. **Concurrent edits** — Two admins editing the same program simultaneously is not addressed (last-write-wins vs conflict error).

14. **Downstream impact** — Whether renaming affects enrollments, reports, URLs, or linked courses is not specified.

15. **Audit / history** — No requirement for change logging or "last updated" metadata.
