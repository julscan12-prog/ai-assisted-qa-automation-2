# DS-3 — Program Name Validation and Duplicate Prevention (Test Plan Output)

**Feature:** Program name validation and duplicate prevention  
**Scope:** Admin user — Programs page → "+ New Program" → creation form  
**Source:** DS-3_ticket_INPUT

---

## Positive Flows

---

### TC-001 — Program with special characters in the name is created successfully

**Preconditions:** User is logged in as admin; program **Informatique & IA - Niveau 2** does not already exist  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Click **"+ New Program"**.
3. Enter `Informatique & IA - Niveau 2` in **Program Name**.
4. Enter `Advanced informatics and AI track, level 2` in **Description**.
5. Click **Create**.

**Expected result:** Modal closes. Programs list shows **Informatique & IA - Niveau 2** with the exact name preserved (including `&`, spaces, and hyphen).

**Gherkin:**
```gherkin
Scenario: Accept program name with special characters
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill in Description with "Advanced informatics and AI track, level 2"
  And I click Create
  Then the modal closes
  And the program list shows "Informatique & IA - Niveau 2"
```

---

### TC-002 — Valid alphanumeric program name is accepted

**Preconditions:** User is logged in as admin; **Web Development 2026** does not exist  
**Priority:** High

**Steps:**
1. Open the program creation form.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `Full-stack web development program` in **Description**.
4. Click **Create**.

**Expected result:** Program is created. List shows **Web Development 2026**.

**Gherkin:**
```gherkin
Scenario: Valid standard program name is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-003 — Program name with parentheses, hash, and en-dash is accepted

**Preconditions:** User is logged in as admin; name **Web Dev & Design (2026) – Cohort #1** does not exist  
**Priority:** Medium

**Steps:**
1. Open the program creation form.
2. Enter `Web Dev & Design (2026) – Cohort #1` in **Program Name**.
3. Enter `Special characters validation test` in **Description**.
4. Click **Create**.

**Expected result:** Program is created with the name displayed exactly as entered.

**Gherkin:**
```gherkin
Scenario: Program name with extended special characters is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Web Dev & Design (2026) – Cohort #1"
  And I fill in Description with "Special characters validation test"
  And I click Create
  Then the modal closes
  And the program list shows "Web Dev & Design (2026) – Cohort #1"
```

---

### TC-004 — Program is created when Description is empty but Program Name is valid

**Preconditions:** User is logged in as admin; **Data Science Fundamentals** does not exist  
**Priority:** Medium

**Steps:**
1. Open the program creation form.
2. Enter `Data Science Fundamentals` in **Program Name**.
3. Leave **Description** empty.
4. Click **Create**.

**Expected result:** Program is created. Name validation does not block submission when Description is optional.

**Gherkin:**
```gherkin
Scenario: Valid Program Name with empty Description is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Data Science Fundamentals"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
```

---

## Negative Flows

---

### TC-005 — Whitespace-only Program Name prevents form submission

**Preconditions:** User is logged in as admin; on the program creation form  
**Priority:** High

**Steps:**
1. Enter `   ` (three spaces only) in **Program Name**.
2. Optionally enter `Some description text` in **Description**.
3. Click **Create** (or observe **Create** state if disabled).

**Expected result:** Form is not submitted. Name is trimmed and treated as empty. **Create** remains disabled or submit is blocked. No program is added to the list.

**Gherkin:**
```gherkin
Scenario: Reject program name with only whitespace
  Given I am logged in as admin
  And I am on the program creation form
  When I enter "   " as the program name
  And I fill in Description with "Some description text"
  And I click Create
  Then the form is not submitted
  And the program list does not contain a program with an empty or whitespace-only name
```

---

### TC-006 — Empty Program Name prevents submission

**Preconditions:** User is logged in as admin; on the program creation form  
**Priority:** High

**Steps:**
1. Leave **Program Name** empty.
2. Enter `Description without a name` in **Description**.
3. Observe **Create**.

**Expected result:** **Create** is disabled. No program is created.

**Gherkin:**
```gherkin
Scenario: Empty Program Name is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Description without a name"
  Then the Create button is disabled
  And no program is created
```

---

### TC-007 — Duplicate Program Name is rejected with a clear error

**Preconditions:** User is logged in as admin; program **Web Development 2026** already exists  
**Priority:** High

**Steps:**
1. Open the program creation form.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `Duplicate attempt description` in **Description**.
4. Click **Create**.

**Expected result:** Program is not created. User sees an error indicating the name already exists (e.g. "Program name already exists"). List still contains exactly one **Web Development 2026**.

**Gherkin:**
```gherkin
Scenario: Reject duplicate program name
  Given I am logged in as admin
  And a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list contains only one "Web Development 2026"
```

---

### TC-008 — Duplicate name does not overwrite the existing program

**Preconditions:** Program **Web Development 2026** exists with Description **Full-stack web development program**  
**Priority:** High

**Steps:**
1. Open the program creation form.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `This should not replace the original description` in **Description**.
4. Click **Create**.

**Expected result:** Existing program is unchanged. Original Description remains **Full-stack web development program**. No second row appears.

**Gherkin:**
```gherkin
Scenario: Duplicate create does not modify existing program
  Given I am logged in as admin
  And a program "Web Development 2026" exists with Description "Full-stack web development program"
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "This should not replace the original description"
  And I click Create
  Then the program is not created
  And the program "Web Development 2026" still has Description "Full-stack web development program"
```

---

### TC-009 — Repeated Create clicks do not create multiple programs with the same name

**Preconditions:** User is on the program creation form; **Unique Program 2026** does not exist  
**Priority:** Medium

**Steps:**
1. Enter `Unique Program 2026` in **Program Name**.
2. Enter `Double submit test` in **Description**.
3. Click **Create** twice in quick succession.

**Expected result:** Exactly one **Unique Program 2026** appears in the list.

**Gherkin:**
```gherkin
Scenario: Double submit does not create duplicate programs
  Given I am logged in as admin
  And I am on the program creation form
  And the program list does not show "Unique Program 2026"
  When I fill in Program Name with "Unique Program 2026"
  And I fill in Description with "Double submit test"
  And I click Create twice in quick succession
  Then the program list shows exactly one "Unique Program 2026"
```

---

### TC-010 — Non-admin user cannot bypass name validation via program creation

**Preconditions:** User is logged in as a non-admin role (e.g. instructor)  
**Priority:** High

**Steps:**
1. Navigate to the **Programs** page.
2. Attempt to open the program creation form and create a program.

**Expected result:** **"+ New Program"** is hidden or disabled. Non-admin cannot create programs regardless of name validity.

**Gherkin:**
```gherkin
Scenario: Non-admin cannot create programs
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see an actionable "+ New Program" control
  And I cannot submit a program name through the creation form
```

---

## Edge Cases

---

### TC-011 — Tabs and newlines only in Program Name are treated as empty

**Preconditions:** User is on the program creation form  
**Priority:** High

**Steps:**
1. Enter `\t\t` or `\n\n` (tabs/newlines only) in **Program Name**.
2. Attempt to click **Create**.

**Expected result:** After trim, name is empty. Form is not submitted. No program is created.

**Gherkin:**
```gherkin
Scenario: Tabs and newlines only in Program Name are rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with only tab and newline characters
  And I click Create
  Then the form is not submitted
  And no program is created
```

---

### TC-012 — Leading and trailing whitespace is trimmed before save and duplicate check

**Preconditions:** Program **Mobile Development 2026** does not exist  
**Priority:** High

**Steps:**
1. Open the program creation form.
2. Enter `  Mobile Development 2026  ` in **Program Name**.
3. Click **Create**.

**Expected result:** List shows **Mobile Development 2026** (trimmed). Padded version is not stored.

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces in Program Name are trimmed
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "  Mobile Development 2026  "
  And I click Create
  Then the modal closes
  And the program list shows "Mobile Development 2026"
  And the program list does not show "  Mobile Development 2026  "
```

---

### TC-013 — Duplicate is detected when new name matches existing name after trim

**Preconditions:** Program **Web Development 2026** already exists  
**Priority:** High

**Steps:**
1. Open the program creation form.
2. Enter `  Web Development 2026  ` in **Program Name**.
3. Click **Create**.

**Expected result:** Treated as duplicate of **Web Development 2026**. Error shown. No second program created.

**Gherkin:**
```gherkin
Scenario: Duplicate detection uses trimmed Program Name
  Given I am logged in as admin
  And a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "  Web Development 2026  "
  And I click Create
  Then I see an error indicating the name already exists
  And the program list contains only one "Web Development 2026"
```

---

### TC-014 — Single-character Program Name is accepted

**Preconditions:** Program **A** does not exist  
**Priority:** Medium

**Steps:**
1. Open the program creation form.
2. Enter `A` in **Program Name**.
3. Enter `Minimum length boundary test` in **Description**.
4. Click **Create**.

**Expected result:** Program **A** is created (unless product defines a higher minimum length).

**Gherkin:**
```gherkin
Scenario: Single-character Program Name is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Minimum length boundary test"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

---

### TC-015 — Program Name at maximum length is accepted

**Preconditions:** Maximum **Program Name** length is 255 characters; user is on the creation form  
**Priority:** Medium

**Steps:**
1. Enter a 255-character string in **Program Name** (e.g. `Cybersecurity Advanced Track 2026` padded to 255 chars).
2. Enter `Max length boundary test` in **Description**.
3. Click **Create**.

**Expected result:** Program is created. Full name is stored and displayed per UI rules (no silent truncation).

**Gherkin:**
```gherkin
Scenario: Program Name at maximum length is accepted
  Given I am logged in as admin
  And I am on the program creation form
  And the maximum Program Name length is 255 characters
  When I fill in Program Name with a 255-character string
  And I fill in Description with "Max length boundary test"
  And I click Create
  Then the modal closes
  And the program list shows the program with the full 255-character name
```

---

### TC-016 — Program Name exceeding maximum length is rejected

**Preconditions:** Maximum **Program Name** length is 255 characters  
**Priority:** Medium

**Steps:**
1. Enter a 256-character string in **Program Name**.
2. Attempt to click **Create**.

**Expected result:** **Create** is disabled or validation error is shown. No program is created.

**Gherkin:**
```gherkin
Scenario: Program Name over maximum length is rejected
  Given I am logged in as admin
  And I am on the program creation form
  And the maximum Program Name length is 255 characters
  When I fill in Program Name with a 256-character string
  Then the Create button is disabled or I see a validation error
  And no program is created
```

---

### TC-017 — Unicode and emoji in Program Name are preserved

**Preconditions:** Program **Програма розробки 🎓 2026** does not exist  
**Priority:** Low

**Steps:**
1. Open the program creation form.
2. Enter `Програма розробки 🎓 2026` in **Program Name**.
3. Enter `Unicode and emoji test` in **Description**.
4. Click **Create**.

**Expected result:** Program is created. List displays correct Unicode/emoji without corruption.

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in Program Name are accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Програма розробки 🎓 2026"
  And I fill in Description with "Unicode and emoji test"
  And I click Create
  Then the modal closes
  And the program list shows "Програма розробки 🎓 2026"
```

---

### TC-018 — Case-variant duplicate name policy is applied consistently

**Preconditions:** Program **Web Development 2026** already exists  
**Priority:** Medium

**Steps:**
1. Open the program creation form.
2. Enter `web development 2026` in **Program Name**.
3. Click **Create**.

**Expected result:** Behavior matches product rule: either rejected as duplicate or allowed as a distinct name — must be consistent and documented.

**Gherkin:**
```gherkin
Scenario: Case-variant program name duplicate policy
  Given I am logged in as admin
  And a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "web development 2026"
  And I click Create
  Then the system applies the defined duplicate-name policy consistently
```

---

### TC-019 — HTML/script content in Program Name does not execute or break the UI

**Preconditions:** User is on the program creation form  
**Priority:** High

**Steps:**
1. Enter `<script>alert('xss')</script>` in **Program Name**.
2. Enter `XSS validation test` in **Description**.
3. Click **Create**.
4. View the program in the list.

**Expected result:** No script execution. Text is escaped or sanitized. UI remains stable.

**Gherkin:**
```gherkin
Scenario: HTML and script content in Program Name is safely handled
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "<script>alert('xss')</script>"
  And I fill in Description with "XSS validation test"
  And I click Create
  Then no script is executed in the browser
  And the program list displays the Program Name safely without breaking the page
```

---

### TC-020 — Whitespace becomes valid after user adds non-space characters

**Preconditions:** User is on the program creation form; **Create** is disabled after whitespace-only input  
**Priority:** Medium

**Steps:**
1. Enter `   ` in **Program Name** and confirm **Create** is disabled.
2. Change **Program Name** to `   Cybersecurity 2026   `.
3. Click **Create**.

**Expected result:** **Create** becomes enabled. Program is saved as **Cybersecurity 2026** (trimmed).

**Gherkin:**
```gherkin
Scenario: Valid name after correcting whitespace-only input
  Given I am logged in as admin
  And I am on the program creation form
  And I have entered "   " in Program Name
  And the Create button is disabled
  When I change Program Name to "   Cybersecurity 2026   "
  And I click Create
  Then the modal closes
  And the program list shows "Cybersecurity 2026"
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| Reject program name with only whitespace | TC-005, TC-011 |
| Accept program name with special characters | TC-001, TC-003 |
| Reject duplicate program name | TC-007, TC-013 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Whitespace rejection mechanism** — AC says "form is not submitted (name is trimmed, treated as empty)" but does not specify whether **Create** is disabled proactively, an inline validation message appears, or submit is blocked on click. TC-005 assumes any of these is acceptable.

2. **Exact duplicate error message** — AC says "an error indicating the name already exists" but does not define copy, placement (inline field error vs. toast vs. banner), or whether the modal stays open.

3. **Case sensitivity for duplicates** — Not specified. Is `web development 2026` a duplicate of **Web Development 2026**? TC-018 flags this for product decision.

4. **Trim behavior** — AC implies trim for whitespace-only names but does not state whether leading/trailing spaces on valid names are trimmed before save (TC-012, TC-013).

5. **Maximum Program Name length** — Not defined. TC-015 and TC-016 assume 255 characters pending confirmation.

6. **Minimum Program Name length** — Not defined. TC-014 assumes single character is valid unless product says otherwise.

7. **Allowed special characters** — AC validates `&` and `-` but does not define a full allowlist or whether characters like `/`, `\`, `"`, `'`, or `:` are permitted or rejected.

8. **Duplicate scope** — Unclear whether uniqueness is global, per organization/tenant, or per academic year/cohort.

9. **Concurrent duplicate creation** — Two admins creating the same name simultaneously is not covered; race-condition handling is undefined.

10. **Edit flow interaction** — ACs cover creation only. Duplicate and validation rules on edit/rename (DS-2) are out of scope but should align with create behavior.

11. **"Other required fields"** — AC mentions filling other required fields for the special-character scenario but only **Program Name** and optional **Description** are known; any additional required fields are unspecified.

12. **Validation UX for empty name** — Related create ACs (DS-1) use disabled **Create** for empty names; this feature AC focuses on whitespace-on-submit — consistency between empty vs. whitespace-only UX is not stated.
