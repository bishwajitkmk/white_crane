"""Attestation of DBT Practice: the yes/no checklist teams sign when applying to the directory.

Mirrors the client's Google Form. Statement wording lives in the web app (apps/web/src/lib/attestation.ts);
the API only needs the item ids to validate answers. Bump ATTESTATION_VERSION in both places whenever
items are added, removed or reworded, so each application records which version was signed.
"""

ATTESTATION_VERSION = "2.0"

# Only answered when the program is offered in a residential or inpatient setting.
RESIDENTIAL_ITEMS = ("R1", "R2", "R3", "R4")

# Program practices, skills coaching, consultation team, ancillary treatment.
PRACTICE_ITEMS = tuple(str(n) for n in range(1, 32))


def required_items(residential: bool) -> tuple[str, ...]:
    return (*RESIDENTIAL_ITEMS, *PRACTICE_ITEMS) if residential else PRACTICE_ITEMS
