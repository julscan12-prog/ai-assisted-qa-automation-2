Feature: DS-2 — Edit existing program details

  As an admin user, I want to edit an existing program's details
  so that I can correct or update program information after creation.

  # Happy paths

  Scenario: TC-001 — Open program for editing with pre-populated data
    Given I am logged in as admin
    And I am on the Programs page at "/programs"
    And a program "Web Development 2026" exists with description "Full-stack web development program"
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with Name "Web Development 2026"
    And I see the edit form pre-populated with Description "Full-stack web development program"

  Scenario: TC-002 — Successfully edit a program name
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  Scenario: TC-003 — Edit preserves unchanged fields when only Description changes
    Given I am logged in as admin
    And a program "Data Science Fundamentals" exists with description "Intro to data science"
    And I am editing "Data Science Fundamentals"
    When I change the Description to "Advanced data science track"
    And I leave the Name unchanged
    And I click Save
    Then the modal closes
    And the program list shows "Data Science Fundamentals"
    And the program list shows "Advanced data science track"
    And the program list does not show "Intro to data science"

  Scenario: TC-004 — Edit both Name and Description in one save
    Given I am logged in as admin
    And a program "Cybersecurity 2026" exists with description "Security fundamentals"
    And I am editing "Cybersecurity 2026"
    When I change the Name to "Cybersecurity Bootcamp 2026"
    And I change the Description to "Network and application security program"
    And I click Save
    Then the modal closes
    And the program list shows "Cybersecurity Bootcamp 2026"
    And the program list shows "Network and application security program"

  Scenario: TC-005 — Clear Description while keeping Name
    Given I am logged in as admin
    And a program "Mobile Development 2026" exists with description "iOS and Android track"
    And I am editing "Mobile Development 2026"
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program list shows "Mobile Development 2026"
    And the program list does not show "iOS and Android track"

  Scenario: TC-006 — Dismiss edit modal without saving
    Given I am logged in as admin
    And a program "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing "Web Development 2026"
    When I change the Name to "Draft Rename XYZ"
    And I dismiss the edit modal without clicking Save
    Then the modal closes
    And the program list still shows "Web Development 2026"
    And the program list does not show "Draft Rename XYZ"

  Scenario: TC-007 — Editing one program does not change others
    Given I am logged in as admin
    And programs "Web Development 2026", "Data Science Fundamentals", and "Cybersecurity 2026" exist
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the program list shows "Web Development 2026 - Updated"
    And the program list still shows "Data Science Fundamentals"
    And the program list still shows "Cybersecurity 2026"

  # Negative

  Scenario: TC-008 — Validation prevents saving empty program name
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I clear the Name field
    Then the Save button is disabled
    And no changes are saved

  Scenario: TC-009 — Whitespace-only Name is rejected on edit
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "   "
    Then the Save button is disabled
    And the program list still shows "Web Development 2026"

  Scenario: TC-010 — Duplicate program name is not allowed on edit
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science Fundamentals" exist
    And I am editing "Web Development 2026"
    When I change the Name to "Data Science Fundamentals"
    And I click Save
    Then the program is not updated
    And I see an error indicating the program name already exists
    And the program list still shows "Web Development 2026"
    And the program list contains exactly one "Data Science Fundamentals"

  Scenario: TC-011 — Viewer cannot edit a program
    Given I am logged in as a viewer user
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an actionable edit icon for "Web Development 2026"

  Scenario: TC-012 — Unauthenticated user cannot access program editing
    Given I am not logged in
    When I attempt to navigate to the Programs page
    Then I am redirected to the login page
    And I do not see the edit form

  Scenario: TC-013 — Double save does not create duplicate programs
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save twice in quick succession
    Then the modal closes
    And the program list shows exactly one "Web Development 2026 - Updated"

  Scenario: TC-014 — API failure during edit shows error and preserves original
    Given I am logged in as admin
    And a program "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing "Web Development 2026"
    And the update program API will fail
    When I change the Name to "Network Test Program"
    And I click Save
    Then I see an error message that the program could not be updated
    And the modal remains open with my entered values
    And the program list still shows "Web Development 2026"

  Scenario: TC-015 — Saving without any changes keeps original data
    Given I am logged in as admin
    And a program "Web Development 2026" exists with description "Full-stack web development program"
    And I am editing "Web Development 2026"
    When I click Save without changing any fields
    Then the modal closes
    And the program list still shows "Web Development 2026"
    And the program list still shows "Full-stack web development program"

  # Edge cases

  Scenario: TC-016 — Edit Name to minimum length is accepted
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "A"
    And I click Save
    Then the modal closes
    And the program list shows "A"

  Scenario: TC-017 — Edit Name to maximum length is accepted
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXXX"
    And I click Save
    Then the modal closes
    And the program list shows "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXXX"

  Scenario: TC-018 — Edit Name over maximum length is rejected
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "WebDev2026ProCertFullStackBootcampAdvancedTrackEnterpriseEditionCohortAlphaNorthRegionUSA2026Q1XXXXXX"
    Then the Save button is disabled or I see a validation error
    And the program list still shows "Web Development 2026"

  Scenario: TC-019 — Edit Description to maximum length is accepted
    Given I am logged in as admin
    And a program "Long Description Program" exists
    And I am editing "Long Description Program"
    When I change the Description to "Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web developmen"
    And I click Save
    Then the modal closes
    And the program list shows "Long Description Program"

  Scenario: TC-020 — Edit Description over maximum length is rejected
    Given I am logged in as admin
    And a program "Over Max Description Program" exists
    And I am editing "Over Max Description Program"
    When I change the Description to "Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web development curriculum module covering frontend, backend, and DevOps practices. Full-stack web developmenX"
    And I click Save
    Then I see a validation error or the program is not updated

  Scenario: TC-021 — Edit Name with special characters is accepted
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "Web Dev & Design (2026) – Cohort #1"
    And I click Save
    Then the modal closes
    And the program list shows "Web Dev & Design (2026) – Cohort #1"

  Scenario: TC-022 — Unicode and emoji edits are preserved
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "Програма розробки 🎓 2026"
    And I change the Description to "Опис програми — full-stack 🚀"
    And I click Save
    Then the modal closes
    And the program list shows "Програма розробки 🎓 2026"

  Scenario: TC-023 — Leading and trailing spaces in edited Name are trimmed
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "  Mobile Development 2026  "
    And I click Save
    Then the modal closes
    And the program list shows "Mobile Development 2026"
    And the program list does not show "  Mobile Development 2026  "

  Scenario: TC-024 — Case-variant rename duplicate policy
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science Fundamentals" exist
    And I am editing "Web Development 2026"
    When I change the Name to "data science fundamentals"
    And I click Save
    Then the system applies the defined duplicate-name policy consistently

  Scenario: TC-025 — HTML and script content on edit is safely handled
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I change the Name to "<script>alert('xss')</script>"
    And I change the Description to "<img src=x onerror=alert(1)>"
    And I click Save
    Then no script is executed in the browser
    And the program list displays the values safely without breaking the page

  Scenario: TC-026 — Rename back to original name after intermediate change
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    When I edit "Web Development 2026" and change the Name to "Web Development 2026 - Updated"
    And I click Save
    And I edit "Web Development 2026 - Updated" and change the Name to "Web Development 2026"
    And I click Save
    Then the program list shows "Web Development 2026"
    And the program list does not show "Web Development 2026 - Updated"

  Scenario: TC-027 — Edit program that has empty Description
    Given I am logged in as admin
    And a program "Minimal Program" exists with an empty Description
    And I am editing "Minimal Program"
    When I change the Description to "Added after creation"
    And I click Save
    Then the modal closes
    And the program list shows "Minimal Program"
    And the program list shows "Added after creation"

  #
  # Ambiguities and gaps in acceptance criteria
  #
  # - Edit form field labels: ACs say "Name" while create flow (DS-1) uses "Program Name" — confirm UI label.
  # - Save button label and disabled-state rules are not specified (when empty, unchanged, or invalid).
  # - Modal dismiss methods: ACs do not specify Cancel vs X vs Escape vs overlay click.
  # - Duplicate names on rename: not mentioned in DS-2 ACs; create flow (DS-1/Confluence) rejects duplicates.
  # - Max lengths: not in DS-2 ACs; Confluence specifies Program Name max 100 and Description max 500.
  # - Clearing Description to empty: not stated whether empty Description remains allowed after edit.
  # - AI Generation Config: present on create (DS-1) but DS-2 ACs do not mention editing those fields.
  # - Editor role: Confluence may allow EDITOR to edit; Jira ACs mention admin only.
  # - Viewer / unauthenticated behavior: not defined in DS-2 ACs.
  # - Case sensitivity for rename-to-existing: not specified.
  # - Whether Save with no field changes is a no-op success or blocked: not specified.
  # - List refresh timing: AC says "immediately shows" updated name — confirm optimistic vs refetch behavior.
