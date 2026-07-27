# DS-1 — Create New Academic Program (Test Plan Output)

**Jira:** [DS-1](https://legionqaschool.atlassian.net/browse/DS-1) — *Create new academic program*  
**Feature:** Create new academic program  
**Scope:** Admin user — Programs page (`/programs`) → "+ New Program" → creation modal  
**Sources:** DS-1 Jira ACs, Confluence (Program Setup & Architecture Overview), live app exploration (Playwright MCP / headless)

---

## Jira Acceptance Criteria (Source)

```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description

Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"

Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

## Observed App Behavior (Live Exploration)

| Area | Confluence / Jira expectation | Observed on https://test.didaxis.studio |
|------|------------------------------|----------------------------------------|
| Login | Admin access required | `Email`, `Password`, `Sign In` on `/login`; dotenv `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` |
| Programs page | Header + "+ New Program" | Button visible at `/programs` after admin login |
| Create modal | Modal with Program Name, Description | Dialog heading **New Program**; fields `Program Name`, `Description`; buttons **Create**, **Cancel**, X close |
| AI config | Collapsible "AI Generation Config" section | Section present; expands to Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, Focus Areas, Sync/Async slider |
| Create disabled | Empty Program Name → Create disabled | Confirmed; whitespace-only name also keeps Create disabled |
| Description | Optional | Program created with empty Description |
| Name trim | Trim on submit | `"  Mobile Development 2026  "` stored as trimmed name in list |
| Max length | Name max 100, Description max 500 (Confluence) | **Bug [DS-191](https://legionqaschool.atlassian.net/browse/DS-191)** — 101+ char names accepted; 501+ description rejected (TC-025 passes) |
| Duplicate name | 400/409 + error (Confluence) | **Bug [DS-188](https://legionqaschool.atlassian.net/browse/DS-188)** — duplicate names create multiple rows |
| Double submit | Should create one program | **Bug [DS-189](https://legionqaschool.atlassian.net/browse/DS-189)** — double-click creates two rows |
| Case sensitivity | Unique per organization | **Bug [DS-190](https://legionqaschool.atlassian.net/browse/DS-190)** — case variants allowed as distinct names |
| Modal dismiss | X, Cancel, outside click | Cancel, X, Escape, and overlay click all close modal without saving |
| List row | Name + description preview + actions | Row shows program name, description text, `Edit {name}` and `Delete {name}` icon buttons |
| Unauthenticated | Redirect to login | Direct `/programs` navigates to `/login` |
| API failure | Error shown, modal stays open | Simulated 500 on POST keeps modal open with entered name retained |

---

## Positive Flows

---

### TC-001 — Program creation modal displays Program Name and Description fields

**Preconditions:** User is logged in as admin  
**Priority:** High

**Steps:**
1. Navigate to the Programs page (`/programs`).
2. Click "+ New Program".

**Expected result:** "New Program" modal opens with **Program Name** and **Description** fields and a disabled **Create** button.

**Gherkin:**
```gherkin
Scenario: Admin opens program creation modal with required fields
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the "New Program" modal with fields: Program Name, Description
  And the Create button is disabled
```

---

### TC-002 — Valid program is saved, modal closes, and new program appears in list

**Preconditions:** User is logged in as admin and on the program creation modal  
**Priority:** High

**Steps:**
1. Enter `Web Development 2026` in **Program Name**.
2. Enter `Full-stack web development program` in **Description**.
3. Click **Create**.

**Expected result:** Modal closes. Programs table includes **Web Development 2026** with description preview visible.

**Gherkin:**
```gherkin
Scenario: Successfully create a program
  Given I am on the program creation modal
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program list shows "Full-stack web development program"
```

---

### TC-003 — Program is created when Description is left empty

**Preconditions:** User is logged in as admin and on the program creation modal  
**Priority:** Medium

**Steps:**
1. Enter `Data Science Fundamentals` in **Program Name**.
2. Leave **Description** empty.
3. Click **Create**.

**Expected result:** Modal closes. Programs list shows **Data Science Fundamentals**.

**Gherkin:**
```gherkin
Scenario: Create program with only Program Name filled
  Given I am on the program creation modal
  When I fill in Program Name with "Data Science Fundamentals"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
```

---

### TC-004 — Create button becomes enabled after valid Program Name entry

**Preconditions:** User is on the program creation modal with **Create** disabled (empty Program Name)  
**Priority:** High

**Steps:**
1. Confirm **Create** is disabled.
2. Enter `Cybersecurity 2026` in **Program Name**.

**Expected result:** **Create** becomes enabled.

**Gherkin:**
```gherkin
Scenario: Create button enables when Program Name is provided
  Given I am on the program creation modal
  And the Create button is disabled
  When I fill in Program Name with "Cybersecurity 2026"
  Then the Create button is enabled
```

---

### TC-005 — Closing the modal without submit does not add a program

**Preconditions:** User is on the program creation modal; Programs list does not contain `Draft Program XYZ`  
**Priority:** Medium

**Steps:**
1. Enter `Draft Program XYZ` in **Program Name**.
2. Close the modal via **Cancel** (also verify X, Escape, overlay click).
3. Review the Programs list.

**Expected result:** Modal closes. **Draft Program XYZ** does not appear in the list.

**Gherkin:**
```gherkin
Scenario: Dismiss program creation modal without saving
  Given I am on the program creation modal
  And the program list does not show "Draft Program XYZ"
  When I fill in Program Name with "Draft Program XYZ"
  And I dismiss the program creation modal without clicking Create
  Then the modal closes
  And the program list does not show "Draft Program XYZ"
```

---

### TC-023 — AI Generation Config section is available in create modal

**Preconditions:** User is on the program creation modal  
**Priority:** Low

**Steps:**
1. Observe the modal below Description.
2. Expand **AI Generation Config**.

**Expected result:** Collapsible section shows optional fields: Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, Focus Areas, Sync/Async Ratio. Program can still be created without filling them.

**Gherkin:**
```gherkin
Scenario: Create modal exposes optional AI Generation Config
  Given I am on the program creation modal
  When I expand "AI Generation Config"
  Then I see fields for Total Program Hours, Default Session Hours, and Default Exam Hours
  And I can create a program without filling AI config fields
```

---

### TC-024 — Program list displays description preview and row actions

**Preconditions:** A program with a description exists in the list  
**Priority:** Medium

**Steps:**
1. Create a program with name and description.
2. Inspect its table row.

**Expected result:** Row shows program name, description preview text, **Edit {name}** button, and **Delete {name}** button.

**Gherkin:**
```gherkin
Scenario: Created program appears in list with description and actions
  Given I created a program named "Web Development 2026" with description "Full-stack web development program"
  When I view the Programs list
  Then I see a row with "Web Development 2026"
  And I see "Full-stack web development program" in that row
  And I see an "Edit Web Development 2026" action
  And I see a "Delete Web Development 2026" action
```

---

## Negative Flows

---

### TC-006 — Empty Program Name prevents submission via disabled Create button

**Preconditions:** User is on the program creation modal  
**Priority:** High

**Steps:**
1. Leave **Program Name** empty.
2. Optionally enter text in **Description** (e.g. `Some description`).
3. Observe **Create**.

**Expected result:** **Create** remains disabled. No program is created.

**Gherkin:**
```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation modal
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-007 — Program Name containing only spaces is treated as empty

**Preconditions:** User is on the program creation modal  
**Priority:** High

**Steps:**
1. Enter `   ` (spaces only) in **Program Name**.
2. Observe **Create**.

**Expected result:** **Create** stays disabled. No program named only whitespace is created.

**Gherkin:**
```gherkin
Scenario: Whitespace-only Program Name is rejected
  Given I am on the program creation modal
  When I fill in Program Name with "   "
  Then the Create button is disabled
  And no program is created
```

---

### TC-008 — Non-admin users cannot open or use the create program flow

**Preconditions:** User is logged in as a non-admin role (e.g. Viewer)  
**Priority:** High

**Steps:**
1. Navigate to the Programs page.
2. Look for "+ New Program" and attempt to open the creation modal.

**Expected result:** Per Confluence, **Viewer** has read-only access — "+ New Program" is hidden or disabled. **Editor** may create programs (out of DS-1 admin scope but documented).

**Gherkin:**
```gherkin
Scenario: Viewer cannot create a program
  Given I am logged in as a viewer user
  When I navigate to the Programs page
  Then I do not see an actionable "+ New Program" control
  And I cannot open the program creation modal
```

---

### TC-009 — Logged-out users are redirected to login

**Preconditions:** User is not logged in  
**Priority:** High

**Steps:**
1. Open `/programs` directly.

**Expected result:** User is redirected to `/login`. Creation modal is not available.

**Gherkin:**
```gherkin
Scenario: Unauthenticated user cannot access program creation
  Given I am not logged in
  When I attempt to navigate to the Programs page
  Then I am redirected to the login page
  And I do not see the program creation modal
```

---

### TC-010 — System prevents creating a program with an existing name

**Preconditions:** Program **Web Development 2026** already exists in the list  
**Priority:** High  
**Jira bug:** [DS-188](https://legionqaschool.atlassian.net/browse/DS-188)

**Steps:**
1. Open the program creation modal.
2. Enter `Web Development 2026` in **Program Name**.
3. Enter `Duplicate attempt` in **Description**.
4. Click **Create**.

**Expected result (Confluence):** Program is not created. User sees error (e.g. "Program name already exists"). List contains only one **Web Development 2026**.

**Gherkin:**
```gherkin
Scenario: Duplicate program name is not allowed
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am on the program creation modal
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt"
  And I click Create
  Then the program is not created
  And I see an error indicating the program name already exists
  And the program list contains only one "Web Development 2026"
```

---

### TC-011 — Repeated Create clicks do not create multiple identical programs

**Preconditions:** User is on the program creation modal; **Unique Program 2026** does not exist  
**Priority:** Medium  
**Jira bug:** [DS-189](https://legionqaschool.atlassian.net/browse/DS-189)

**Steps:**
1. Fill **Program Name** with `Unique Program 2026`.
2. Fill **Description** with `Test double submit`.
3. Click **Create** twice quickly.

**Expected result:** Exactly one **Unique Program 2026** appears in the list.

**Gherkin:**
```gherkin
Scenario: Double submit does not create duplicate programs
  Given I am on the program creation modal
  And the program list does not show "Unique Program 2026"
  When I fill in Program Name with "Unique Program 2026"
  And I fill in Description with "Test double submit"
  And I click Create twice in quick succession
  Then the modal closes
  And the program list shows exactly one "Unique Program 2026"
```

---

### TC-012 — Failed save shows error and does not falsely add program to list

**Preconditions:** Simulate API failure (500) during create  
**Priority:** Medium

**Steps:**
1. Fill **Program Name** with `Network Test Program`.
2. Fill **Description** with `Simulated failure`.
3. Click **Create** while backend returns 500.

**Expected result:** Error message shown. **Network Test Program** is not in the list. Modal stays open with entered values retained.

**Gherkin:**
```gherkin
Scenario: API failure during create shows error
  Given I am on the program creation modal
  And the create program API will fail
  When I fill in Program Name with "Network Test Program"
  And I fill in Description with "Simulated failure"
  And I click Create
  Then I see an error message that the program could not be created
  And the program list does not show "Network Test Program"
  And the modal remains open with my entered values
```

---

## Edge Cases

---

### TC-013 — Single-character Program Name is accepted

**Preconditions:** User is on the program creation modal  
**Priority:** Medium

**Steps:**
1. Enter `A` in **Program Name**.
2. Enter `Single letter name test` in **Description**.
3. Click **Create**.

**Expected result:** Program **A** is created and appears in the list.

**Gherkin:**
```gherkin
Scenario: Minimum length Program Name is accepted
  Given I am on the program creation modal
  When I fill in Program Name with "A"
  And I fill in Description with "Single letter name test"
  And I click Create
  Then the modal closes
  And the program list shows "A"
```

---

### TC-014 — Program Name at max length (100) is saved correctly

**Preconditions:** Max length per Confluence is 100 characters  
**Priority:** Medium

**Steps:**
1. Enter a name of exactly 100 characters.
2. Enter `Max length boundary test` in **Description**.
3. Click **Create**.

**Expected result:** Program is created with full name in list.

**Gherkin:**
```gherkin
Scenario: Program Name at maximum length is accepted
  Given I am on the program creation modal
  And the maximum Program Name length is 100 characters
  When I fill in Program Name with a 100-character string
  And I fill in Description with "Max length boundary test"
  And I click Create
  Then the modal closes
  And the program list shows the program with the full 100-character name
```

---

### TC-015 — Over-max Program Name (101+) is rejected

**Preconditions:** Max length 100 per Confluence  
**Priority:** Medium  
**Jira bug:** [DS-191](https://legionqaschool.atlassian.net/browse/DS-191)

**Steps:**
1. Enter 101 characters in **Program Name**.
2. Attempt to click **Create**.

**Expected result:** Validation error or disabled submit; no invalid program created.

**Gherkin:**
```gherkin
Scenario: Program Name over maximum length is rejected
  Given I am on the program creation modal
  And the maximum Program Name length is 100 characters
  When I fill in Program Name with a 101-character string
  Then the Create button is disabled or I see a validation error
  And no program is created
```

---

### TC-016 — Description at max length (500) is saved correctly

**Preconditions:** Max length per Confluence is 500 characters  
**Priority:** Low

**Steps:**
1. Enter `Long Description Program` in **Program Name**.
2. Enter exactly 500 characters in **Description**.
3. Click **Create**.

**Expected result:** Program created; description stored and shown in list preview.

**Gherkin:**
```gherkin
Scenario: Description at maximum length is accepted
  Given I am on the program creation modal
  And the maximum Description length is 500 characters
  When I fill in Program Name with "Long Description Program"
  And I fill in Description with a 500-character string
  And I click Create
  Then the modal closes
  And the program list shows "Long Description Program"
```

---

### TC-025 — Description over max length (501+) is rejected

**Preconditions:** Max length 500 per Confluence  
**Priority:** Low  
**Status:** Verified passing — app rejects 501+ char descriptions (TC-025)

**Steps:**
1. Enter a valid Program Name.
2. Enter 501 characters in **Description**.
3. Click **Create**.

**Expected result:** Validation error; program not created with oversized description.

**Gherkin:**
```gherkin
Scenario: Description over maximum length is rejected
  Given I am on the program creation modal
  And the maximum Description length is 500 characters
  When I fill in Description with a 501-character string
  And I click Create
  Then I see a validation error or the program is not created
```

---

### TC-017 — Program Name with allowed special characters is saved correctly

**Preconditions:** User is on the program creation modal  
**Priority:** Medium

**Steps:**
1. Enter `Web Dev & Design (2026) – Cohort #1` in **Program Name**.
2. Enter `Special chars test` in **Description**.
3. Click **Create**.

**Expected result:** Program appears in list with exact name.

**Gherkin:**
```gherkin
Scenario: Program Name with special characters is accepted
  Given I am on the program creation modal
  When I fill in Program Name with "Web Dev & Design (2026) – Cohort #1"
  And I fill in Description with "Special chars test"
  And I click Create
  Then the modal closes
  And the program list shows "Web Dev & Design (2026) – Cohort #1"
```

---

### TC-018 — Unicode characters are handled without corruption

**Preconditions:** User is on the program creation modal  
**Priority:** Low

**Steps:**
1. Enter `Програма розробки 🎓 2026` in **Program Name**.
2. Enter `Опис програми — full-stack 🚀` in **Description**.
3. Click **Create**.

**Expected result:** Program created; list shows correct Unicode/emoji.

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in fields are preserved
  Given I am on the program creation modal
  When I fill in Program Name with "Програма розробки 🎓 2026"
  And I fill in Description with "Опис програми — full-stack 🚀"
  And I click Create
  Then the modal closes
  And the program list shows "Програма розробки 🎓 2026"
```

---

### TC-019 — Trimmed Program Name is stored without leading/trailing spaces

**Preconditions:** User is on the program creation modal  
**Priority:** Medium

**Steps:**
1. Enter `  Mobile Development 2026  ` in **Program Name**.
2. Click **Create**.

**Expected result:** List shows **Mobile Development 2026** (trimmed).

**Gherkin:**
```gherkin
Scenario: Leading and trailing spaces in Program Name are trimmed
  Given I am on the program creation modal
  When I fill in Program Name with "  Mobile Development 2026  "
  And I click Create
  Then the modal closes
  And the program list shows "Mobile Development 2026"
  And the program list does not show "  Mobile Development 2026  "
```

---

### TC-020 — Duplicate detection for differing case is case-sensitive

**Preconditions:** Program **Web Development 2026** exists  
**Priority:** Medium  
**Jira bug:** [DS-190](https://legionqaschool.atlassian.net/browse/DS-190)

**Steps:**
1. Open creation modal.
2. Enter `web development 2026` in **Program Name**.
3. Click **Create**.

**Expected result (Confluence):** Rejected as duplicate. **Observed:** Allowed as separate program — document as product gap.

**Gherkin:**
```gherkin
Scenario: Case-variant program name duplicate policy
  Given I am logged in as admin
  And the program list shows "Web Development 2026"
  And I am on the program creation modal
  When I fill in Program Name with "web development 2026"
  And I click Create
  Then the system applies the defined duplicate-name policy consistently
```

---

### TC-021 — Script/HTML in inputs does not execute or break the UI

**Preconditions:** User is on the program creation modal  
**Priority:** High

**Steps:**
1. Enter `<script>alert('xss')</script>` in **Program Name**.
2. Enter `<img src=x onerror=alert(1)>` in **Description**.
3. Click **Create**.
4. View the program in the list.

**Expected result:** No script execution. Text escaped/sanitized; UI stable.

**Gherkin:**
```gherkin
Scenario: HTML and script content in fields is safely handled
  Given I am on the program creation modal
  When I fill in Program Name with "<script>alert('xss')</script>"
  And I fill in Description with "<img src=x onerror=alert(1)>"
  And I click Create
  Then no script is executed in the browser
  And the program list displays the values safely without breaking the page
```

---

### TC-022 — Empty Description with long Program Name (99 chars) succeeds

**Preconditions:** User is on the program creation modal  
**Priority:** Low

**Steps:**
1. Enter a 99-character Program Name (under 100 max).
2. Leave **Description** empty.
3. Click **Create**.

**Expected result:** Program created successfully.

**Gherkin:**
```gherkin
Scenario: Long Program Name with empty Description succeeds
  Given I am on the program creation modal
  When I fill in Program Name with a 99-character string
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows the program with the 99-character name
```

---

## Traceability Matrix (AC → Test Cases)

| Acceptance criteria | Test case(s) |
|---------------------|--------------|
| Navigate to form; fields Program Name, Description | TC-001, TC-023 |
| Successfully create program | TC-002, TC-024 |
| Create disabled when Program Name empty | TC-006, TC-004 (inverse) |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description optional** — Confirmed optional in Confluence and live app (TC-003).

2. **Max length** — Confluence specifies Name **100**, Description **500**; app does not enforce client-side (TC-014–TC-016, TC-025 document gaps).

3. **Duplicate names** — Confluence requires server rejection; **app bug** allows duplicates (TC-010, TC-020).

4. **Double submit** — Not in ACs; **app bug** creates duplicate rows (TC-011).

5. **AI Generation Config** — Not in Jira ACs but present in create modal (TC-023).

6. **Editor role** — Confluence allows EDITOR to create; Jira ACs mention admin only (TC-008).

7. **List refresh** — Confluence requires immediate list update after mutation; observed after successful create (TC-002).

8. **Error handling** — API failure behavior verified via route mock (TC-012); duplicate/over-max server errors not surfaced in current build.

9. **Permissions** — Viewer access not testable without viewer credentials (TC-008 manual).

10. **Programs as top-level container** — Per Architecture Overview, programs hold semesters/courses/templates (Layer 1 curriculum structure).
