/**
 * Attestation of DBT Practice: wording from the client's Google Form. The API validates answers by item id
 * (apps/api/app/attestation.py); bump ATTESTATION_VERSION in both places whenever items change.
 */
export const ATTESTATION_VERSION = '2.0'

export const ATTESTATION_INTRO = [
  'This attestation is completed by the DBT Team Leader in collaboration with the DBT program/consultation team. It documents that the program is delivering Dialectical Behavior Therapy consistent with the evidence-based model (Linehan, 1993) and is used in assessing program fidelity.',
  'Please answer each statement based on current program practice. Where you answer "No," use the comment box at the end of the section to explain and describe your plan to address it.',
]

export const ATTESTATION_STATEMENT =
  'I attest that, to the best of my knowledge, the information provided in this form is accurate and reflects the current practices of this DBT program. I understand that these practices may be verified through a fidelity review, and I agree to notify White Crane Training Collective of any significant changes to the program.'

export const DBT_SERVICES = [
  'Outpatient (OP): Adult',
  'Outpatient (OP): Adolescent/Family',
  'Intensive Outpatient/Partial Hospital (IOP/PHP): Adult',
  'Intensive Outpatient/Partial Hospital (IOP/PHP): Adolescent',
  'Inpatient (IP): Adult',
  'Inpatient (IP): Adolescent/Family',
  'DBT for Eating Disorders (DBT-ED): Adult',
  'DBT for Eating Disorders (DBT-ED): Adolescent/Family',
  'DBT for Substance Use (DBT-SUD): Adult',
  'DBT for Substance Use (DBT-SUD): Adolescent/Family',
]

export interface AttestationItem {
  id: string
  text: string
}

export interface AttestationGroup {
  title: string
  items: AttestationItem[]
}

const numbered = (start: number, texts: string[]): AttestationItem[] =>
  texts.map((text, i) => ({ id: String(start + i), text }))

/** Only answered when the program is offered in a residential or inpatient setting. */
export const RESIDENTIAL_ITEMS: AttestationItem[] = [
  { id: 'R1', text: 'Skills training is provided on a more intensive basis (more than two hours per week) as appropriate.' },
  { id: 'R2', text: 'Milieu staff are trained to provide validation, contingent warmth, compassionate inattention, and application of basic behavioral strategies.' },
  { id: 'R3', text: 'Use of self-monitoring is promoted and structured to the extent appropriate (e.g., diary cards are done in groups, reviewed frequently, collected and stored for consumers).' },
  { id: 'R4', text: 'Staff working shifts outside of business hours have access to coaching by primary providers and program leadership as necessary for continuous program implementation.' },
]

export const PRACTICE_GROUPS: AttestationGroup[] = [
  {
    title: 'Program practices',
    items: numbered(1, [
      'The DBT program has a Program Manual consistent with checklist provided on WhiteCraneTraining.org. The manual has been approved and signed by agency administration/owner and is reviewed and updated at least annually.',
      'The program has a clearly stated mission and philosophy consistent with the DBT text (1993) that appears in the Program Manual and on program materials (e.g., brochures, client handouts), and is known to key staff.',
      'Inclusion/exclusion criteria for the DBT program are documented in the Program Manual, and a screening tool and/or referral form is used by intake staff to guide referrals to DBT.',
      'DBT participation is voluntary for both providers and consumers of the agency.',
      'Each DBT team has a designated DBT Team Leader who is the recognized administrative head of the team.',
      'The DBT program has a structure for managing assignments of clients to clinicians for orientation and commitment and for ongoing treatment.',
      'Individual DBT-based psychotherapy is offered by the DBT program and is available to all consumers as needed.',
      'The DBT individual provider makes all final decisions about significant issues in treatment planning (in consultation with the DBT team when appropriate).',
      'Group skills training is co-led and available to all consumers as needed.',
      'Provider schedules function in such a way as to offer reasonable availability of services for consumers (e.g., evening groups, a variety of individual provider times).',
      'Program follows the contingencies established to meet the functions of the treatment, and does so consistently (e.g., 4-miss rule, 24-hour rule).',
      'Documentation in each mode of treatment reflects that the structure of DBT treatment for that mode has been fulfilled, risk has been assessed, and interventions (both implemented and planned) are deliberate, considered, and consistent with the DBT model and a reasonable standard of care.',
      'Program tracks outcomes for individual clients. Client outcomes monitored include, but are not limited to: attendance/completion of the DBT program, change in major behavioral targets, and satisfaction with treatment/providers.',
      "DBT program tracks program outcomes, including (but not limited to): consultation team attendance, numbers of clients treated in each component, team members' adherence in providing DBT, and aggregate client outcome measures.",
    ]),
  },
  {
    title: 'Skills coaching and crisis services',
    items: numbered(15, [
      '24/7 skills coaching is available to all consumers in comprehensive DBT from their primary individual provider.',
      'Emergency contact information is available to any provider who provides DBT coaching outside of business hours.',
      'Standard crisis intervention services are available to DBT consumers.',
      'Suicidal, self-harm, and homicidal behaviors are formally assessed at intake and monitored throughout treatment; each client has a documented crisis/relapse-prevention plan and at least one current emergency contact release of information.',
    ]),
  },
  {
    title: 'Consultation team',
    items: numbered(19, [
      'The DBT consultation team is responsible for treating and monitoring the quality of care delivered by the DBT providers.',
      'A formal orientation and commitment process is undertaken with each prospective new member of the DBT team.',
      'The DBT team collaboratively develops and then follows a schedule of events in the consultation team meeting.',
      'Each DBT provider is given sufficient opportunity to practice skills, to ask for consultation, and to provide feedback about team functioning.',
      'The DBT program/team agrees upon and follows clear contingencies for any provider failing to work to gain knowledge, skills, and abilities; to prepare for or meet the role obligations of team meetings; or to be prompt, mindful, and remain to the end of team meetings.',
      'Team members support each other in remaining vulnerable and aware of their own fallibilities, non-judgmental in providing direct feedback, and non-defensive in receiving that feedback ("elephants are not allowed to roam freely on the team").',
      'DBT providers use principles and constructs consistent with DBT to conceptualize and treat DBT clients (behavioral). Team time is not used to debate the merits of the model in comparison to other models and conceptualizations.',
      'Consultation team minutes are maintained weekly and include the date, length of meeting, attendance and absences, and brief but meaningful information about how the team functioned relative to: mindfulness practice, review of DBT principles, practice of contingency management (correction/over-correction, behavior chain analysis), administrative issues, teaching, consultation about cases, support of therapists, and feedback about team functioning. Minutes are organized and stored in accordance with HIPAA requirements.',
      'All team members complete standard DBT training (introductory, individual therapy, and suicide assessment/intervention) by approved trainers (see Training Credentials on WhiteCraneTraining.org) within their first six months on the team, and the team maintains an annually updated training plan with documented ongoing training.',
      'DBT program has a plan in place to measure and maintain staff development and morale.',
    ]),
  },
  {
    title: 'Ancillary and concurrent treatment',
    items: numbered(29, [
      'The DBT consultation team/individual providers are consulted by ancillary providers prior to making changes in the treatment plan (e.g., adding groups, changing goals, developing contingencies).',
      'DBT provided concurrently with other treatments is approved only after careful review by the consultation team.',
      'Comprehensive DBT is not provided while a client is in therapy with a non-DBT individual therapist.',
    ]),
  },
]

export const PRACTICE_ITEMS = PRACTICE_GROUPS.flatMap((g) => g.items)

export const requiredItems = (residential: boolean) => (residential ? [...RESIDENTIAL_ITEMS, ...PRACTICE_ITEMS] : PRACTICE_ITEMS)
