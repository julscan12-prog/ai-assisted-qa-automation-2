# DS-2 — Create New Academic Program (Test Plan Output)

**Feature:** Create new academic program  
**Scope:** Admin user — Programs page → "+ New Program" → creation form  
**Source:** DS-1_ticket_INPUT

---

## Positive Flows

---

### TC-001 — Program creation form displays Program Name and Description fields

**Preconditions:** User is logged in as admin  
**Priority:** High

**Steps:**
1. Navigate to the Programs page.
2. Click "+ New Program".

**Expected result:** The program creation form is visible with fields labeled **Program Name** and **Description**.

**Gherkin:**
```gherkin
Scenario: Admin opens program creation form with required fields
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

---

### TC-002 — Valid program is saved, modal closes, and new program appears in list

**Preconditions:** User is logged in as admin and on the program creation form  
**Priority:** High

**Steps:**
1. Enter `Web Development 2026` in **Program Name**.
2. Enter `Full-stack web development program` in **Description**.
3. Click **Create**.

**Expected result:** The modal closes. The Programs list includes **Web Development 2026**.

**Gherkin:**
```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-003 — Program is created when Description is left empty

**Preconditions:** User is logged in as admin and on the program creation form  
**Priority:** Medium

**Steps:**
1. Enter `Data Science Fundamentals` in **Program Name**.
2. Leave **Description** empty.
3. Click **Create**.

**Expected result:** The modal closes. The Programs list shows **Data Science Fundamentals**.

**Gherkin:**
```gherkin
Scenario: Create program with only Program Name filled
  Given I am on the program creation form
  When I fill in Program Name with "Data Science Fundamentals"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
```

---

### TC-004 — Create button becomes enabled after valid Program Name entry

**Preconditions:** User is on the program creation form with **Create** disabled (empty Program Name)  
**Priority:** High

**Steps:**
1. Confirm **Create** is disabled.
2. Enter `Cybersecurity 2026` in **Program Name**.

**Expected result:** **Create** becomes enabled.

**Gherkin:**
```gherkin
Scenario: Create button enables when Program Name is provided
  Given I am on the program creation form
  And the Create button is disabled
  When I fill in Program Name with "Cybersecurity 2026"
  Then the Create button is enabled
```

---

### TC-005 — Closing the form without submit does not add a program

**Preconditions:** User is on the program creation form; Programs list is known (e.g. does not contain `Draft Program XYZ`)  
**Priority:** Medium

**Steps:**
1. Enter `Draft Program XYZ` in **Program Name**.
2. Close the modal (Cancel, X, or Escape — per product convention).
3. Review the Programs list.

**Expected result:** Modal closes. **Draft Program XYZ** does not appear in the list.

**Gherkin:**
```gherkin
Scenario: Dismiss program creation form without saving
  Given I am on the program creation form
  And the program list does not show "Draft Program XYZ"
  When I fill in Program Name with "Draft Program XYZ"
  And I dismiss the program creation form without clicking Create
  Then the modal closes
  And the program list does not show "Draft Program XYZ"
```

---

## Negative Flows

---

### TC-006 — Empty Program Name prevents submission via disabled Create button

**Preconditions:** User is on the program creation form  
**Priority:** High

**Steps:**
1. Leave **Program Name** empty.
2. Optionally enter text in **Description** (e.g. `Some description`).
3. Observe **Create**.

**Expected result:** **Create** remains disabled. No program is created.

**Gherkin:**
```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-007 — Program Name containing only spaces is treated as empty

**Preconditions:** User is on the program creation form  
**Priority:** High

**Steps:**
1. Enter `   ` (spaces only) in **Program Name**.
2. Observe **Create**.

**Expected result:** **Create** stays disabled (or trim validation blocks submit). No program named only whitespace is created.

**Gherkin:**
```gherkin
Scenario: Whitespace-only Program Name is rejected
  Given I am on the program creation form
  When I fill in Program Name with "   "
  Then the Create button is disabled
  And no program is created
```

---

### TC-008 — Non-admin users cannot open or use the create program flow

**Preconditions:** User is logged in as a non-admin role (e.g. instructor, student)  
**Priority:** High

**Steps:**
1. Navigate to the Programs page (or attempt direct URL if known).
2. Look for "+ New Program" and attempt to open the creation form.

**Expected result:** "+ New Program" is hidden or disabled, or access is denied. Program creation form is not usable.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot create a program
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see an actionable "+ New Program" control
  And I cannot open the program creation form
```

---

### TC-009 — Logged-out users are redirected or blocked from program creation

**Preconditions:** User is not logged in  
**Priority:** High

**Steps:**
1. Open the Programs page or program creation URL directly.

**Expected result:** User is redirected to login or receives an unauthorized response. Creation form is not available.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot access program creation
  Given I am not logged in
  When I attempt to navigate to the Programs page
  Then I am redirected to the login page
  And I do not see the program creation form
```

---

### TC-010 — System prevents creating a program with an existing name

**Preconditions:** Program **Web Development 2026** already exists in the list  
**Priority:** High

**Steps:**
1. Open the program creation form.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `Duplicate attempt` in **Description**.
4. Click **Create**.

**Expected result:** Program is not created. User sees a clear error (e.g. "Program name already exists"). Modal stays open or closes with error toast; list still has a single **Web Development 2026**.

**Gherkin:**
```gherkin
Scenario: Duplicate program name is not allowed
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt"
  And I click Create
  Then the program is not created
  And I see an error indicating the program name already exists
  And the program list contains only one "Web Development 2026"
```

---

### TC-011 — Repeated Create clicks do not create multiple identical programs

**Preconditions:** User is on the program creation form; **Unique Program 2026** does not exist  
**Priority:** Medium

**Steps:**
1. Fill **Program Name** with `Unique Program 2026`.
2. Fill **Description** with `Test double submit`.
3. Click **Create** twice quickly (or while request is in flight).

**Expected result:** Exactly one **Unique Program 2026** appears in the list.

**Gherkin:**
```gherkin
Scenario: Double submit does not create duplicate programs
  Given I am on the program creation form
  And the program list does not show "Unique Program 2026"
  When I fill in Program Name with "Unique Program 2026"
  And I fill in Description with "Test double submit"
  And I click Create twice in quick succession
  Then the modal closes
  And the program list shows exactly one "Unique Program 2026"
```

---

### TC-012 — Failed save shows error and does not falsely add program to list

**Preconditions:** Simulate or trigger API failure (500, network offline) during create  
**Priority:** Medium

**Steps:**
1. Fill **Program Name** with `Network Test Program`.
2. Fill **Description** with `Simulated failure`.
3. Click **Create** while backend is unavailable.

**Expected result:** Error message is shown. **Network Test Program** is not in the list. Entered values remain (if modal stays open).

**Gherkin:**
```gherkin
Scenario: API failure during create shows error
  Given I am on the program creation form
  And the create program API will fail
  When I fill in Program Name with "Network Test Program"
  And I fill in Description with "Simulated failure"
  And I click Create
  Then I see an error message that the program could not be created
  And the program list does not show "Network Test Program"
```

---

## Edge Cases

---

### TC-013 — Single-character Program Name is accepted

**Preconditions:** User is on the program creation form  
**Priority:** Medium

**Steps:**
1. Enter `A` in **Program Name**.
2. Enter `Single letter name test` in **Description**.
3. Click **Create**.

**Expected result:** Program **A** is created and appears in the list (unless product defines a higher minimum).

**Gherkin:**
```gherkin
Scenario: Minimum length Program Name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single letter name test"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

---

### TC-014 — Program Name at max length is saved correctly

**Preconditions:** Max length for Program Name is known (e.g. 255); user is on creation form  
**Priority:** Medium

**Steps:**
1. Enter a name of exactly max length (e.g. 255 × `x`).
2. Enter `Max length boundary test` in **Description**.
3. Click **Create**.

**Expected result:** Program is created with full name displayed/truncated per UI rules. No silent truncation without indication.

**Gherkin:**
```gherkin
Scenario: Program Name at maximum length is accepted
  Given I am on the program creation form
  And the maximum Program Name length is 255 characters
  When I fill in Program Name with a 255-character string
  And I fill in Description with "Max length boundary test"
  And I click Create
  Then the modal closes
  And the program list shows the program with the full 255-character name
```

---

### TC-015 — Over-max Program Name cannot be submitted

**Preconditions:** Max length known; user is on creation form  
**Priority:** Medium

**Steps:**
1. Enter max length + 1 characters in **Program Name**.
2. Attempt to click **Create**.

**Expected result:** Input is prevented or validation error shown; **Create** disabled or submit rejected. No invalid program created.

**Gherkin:**
```gherkin
Scenario: Program Name over maximum length is rejected
  Given I am on the program creation form
  And the maximum Program Name length is 255 characters
  When I fill in Program Name with a 256-character string
  Then the Create button is disabled or I see a validation error
  And no program is created
```

---

### TC-016 — Description at max length is saved correctly

**Preconditions:** Max length for Description known; user is on creation form  
**Priority:** Low

**Steps:**
1. Enter `Long Description Program` in **Program Name**.
2. Enter max-length text in **Description**.
3. Click **Create**.

**Expected result:** Program created; full description stored and displayed per UI rules.

**Gherkin:**
```gherkin
Scenario: Description at maximum length is accepted
  Given I am on the program creation form
  And the maximum Description length is 1000 characters
  When I fill in Program Name with "Long Description Program"
  And I fill in Description with a 1000-character string
  And I click Create
  Then the modal closes
  And the program list shows "Long Description Program"
```

---

### TC-017 — Program Name with allowed special characters is saved correctly

**Preconditions:** User is on the program creation form  
**Priority:** Medium

**Steps:**
1. Enter `Web Dev & Design (2026) – Cohort #1` in **Program Name**.
2. Enter `Special chars test` in **Description**.
3. Click **Create**.

**Expected result:** Program appears in list with exact name (encoding/display correct).

**Gherkin:**
```gherkin
Scenario: Program Name with special characters is accepted
  Given I am on the program creation form
  When I fill in Program Name with "Web Dev & Design (2026) – Cohort #1"
  And I fill in Description with "Special chars test"
  And I click Create
  Then the modal closes
  And the program list shows "Web Dev & Design (2026) – Cohort #1"
```

---

### TC-018 — Unicode characters are handled without corruption

**Preconditions:** User is on the program creation form  
**Priority:** Low

**Steps:**
1. Enter `Програма розробки 🎓 2026` in **Program Name**.
2. Enter `Опис програми — full-stack 🚀` in **Description**.
3. Click **Create**.

**Expected result:** Program created; list shows correct Unicode/emoji (no mojibake).

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in fields are preserved
  Given I am on the program creation form
  When I fill in Program Name with "Програма розробки 🎓 2026"
  And I fill in Description with "Опис програми — full-stack 🚀"
  And I click Create
  Then the modal closes
  And the program list shows "Програма розробки 🎓 2026"
```

---

### TC-019 — Trimmed Program Name is stored without leading/trailing spaces

**Preconditions:** User is on the program creation form  
**Priority:** Medium

**Steps:**
1. Enter `  Mobile Development 2026  ` in **Program Name**.
2. Click **Create**.

**Expected result:** List shows **Mobile Development 2026** (trimmed), not padded version. Duplicate check uses trimmed value.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces in Program Name are trimmed
  Given I am on the program creation form
  When I fill in Program Name with "  Mobile Development 2026  "
  And I click Create
  Then the modal closes
  And the program list shows "Mobile Development 2026"
  And the program list does not show "  Mobile Development 2026  "
```

---

### TC-020 — Duplicate detection behavior for differing case is consistent

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium

**Steps:**
1. Open creation form.
2. Enter `web development 2026` in **Program Name**.
3. Click **Create**.

**Expected result:** Behavior matches product rule: either rejected as duplicate or allowed as distinct name — documented and consistent.

**Gherkin:**
```gherkin
Scenario: Case-variant program name duplicate policy
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am on the program creation form
  When I fill in Program Name with "web development 2026"
  And I click Create
  Then the system applies the defined duplicate-name policy consistently
```

---

### TC-021 — Script/HTML in inputs does not execute or break the UI

**Preconditions:** User is on the program creation form  
**Priority:** High

**Steps:**
1. Enter `<script>alert('xss')</script>` in **Program Name**.
2. Enter `<img src=x onerror=alert(1)>` in **Description**.
3. Click **Create**.
4. View the program in the list.

**Expected result:** No script execution. Text is escaped or sanitized; UI remains stable.

**Gherkin:**
```gherkin
Scenario: HTML and script content in fields is safely handled
  Given I am on the program creation form
  When I fill in Program Name with "<script>alert('xss')</script>"
  And I fill in Description with "<img src=x onerror=alert(1)>"
  And I click Create
  Then no script is executed in the browser
  And the program list displays the values safely without breaking the page
```

---

### TC-022 — Empty Description with long Program Name succeeds

**Preconditions:** User is on the program creation form  
**Priority:** Low

**Steps:**
1. Enter a 200-character Program Name (under assumed max).
2. Leave **Description** empty.
3. Click **Create**.

**Expected result:** Program created successfully; list displays long name correctly.

**Gherkin:**
```gherkin
Scenario: Long Program Name with empty Description succeeds
  Given I am on the program creation form
  When I fill in Program Name with a 200-character string
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows the program with the 200-character name
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| Navigate to form; fields Program Name, Description | TC-001 |
| Successfully create program | TC-002 |
| Create disabled when Program Name empty | TC-006, TC-004 (inverse) |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description required or optional?** ACs only require empty **Program Name** to disable **Create**. Unclear if **Description** is mandatory (TC-003 assumes optional).

2. **Modal vs full page** — AC says "modal closes" but not how to open/dismiss (Cancel, X, Escape, click outside).

3. **Max length** — No limits for **Program Name** or **Description** (TC-014–TC-016 assume values to be confirmed with dev/UX).

4. **Duplicate names** — Not mentioned; TC-010 and TC-020 need a product decision (case-sensitive? trim?).

5. **Whitespace-only name** — AC covers empty only; trim behavior for `"   "` is unspecified (TC-007, TC-019).

6. **Validation UX** — AC only states **Create** disabled; no inline errors, required markers, or focus behavior.

7. **List behavior after create** — Sort order, search/filter, pagination, and success toast not specified.

8. **Permissions** — Only admin in positive AC; other roles and unauthenticated access not defined (TC-008, TC-009).

9. **Error handling** — Network/API failures and double-submit not covered (TC-011, TC-012).

10. **Special characters / XSS** — Security and i18n rules not in ACs (TC-017–TC-021).

11. **Program attributes** — Only name and description; no status, dates, code, or department fields mentioned.

12. **Edit/delete** — Out of scope for create ACs but affects duplicate and list assertions.
