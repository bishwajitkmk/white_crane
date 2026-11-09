"""Copy, bios and photos supplied by the Board (October 2026). Used as the site's default content, by
seed_demo, and by load_client_content to bring an existing database up to date.

Text blocks are plain text: a blank line starts a new paragraph, "- " starts a bullet and "1. " a numbered
item. Photos live in apps/web/public/team; Administrators can replace any of this from the dashboard.
"""

ABOUT_INTRO = """\
White Crane Training Collective is a non profit organization designed to expand access to skillful, \
compassionate, evidence-based behavioral health care.

We train and support clinicians, treatment teams, and communities in Dialectical Behavior Therapy (DBT) and \
related empirically supported treatments. Our work is grounded in the DBT model developed by Dr. Marsha \
Linehan, informed by current research on emotion and behavior, and shaped by decades of clinical practice.

We believe that high-quality training should be practical, rigorous, and accessible—across settings, \
locations, and levels of resources. By strengthening the people who provide care, we help make effective \
treatment more available to people living with severe emotion dysregulation, behavioral dysregulation, \
suicidality, and other serious life challenges."""

MISSION = """\
White Crane Training Collective advances the effective, faithful practice of DBT and related empirically \
supported treatments by training and supporting the clinicians, teams, and communities who provide them.

We bring together rigorous science, mindful presence, and compassionate care so that providers can offer \
treatment with both precision and heart."""

WHAT_WE_DO = """\
White Crane offers affordable training, consultation, and learning communities for clinicians and \
organizations seeking to strengthen their use of DBT and related evidence-based approaches.

Our work includes:
- Workshops on DBT’s fundamental principles, practices, and processes
- Specialized training on focused DBT topics and related empirically supported treatments
- Consultation for clinicians, treatment teams, and behavioral health programs
- Support for teams working to implement DBT effectively and sustainably
- Guidance for programs seeking to assess and strengthen model fidelity, clinical effectiveness, and team \
functioning
- Practical learning opportunities designed for real-world clinical settings"""

WHO_WE_SERVE = """\
We serve mental health clinicians, interdisciplinary treatment teams, healthcare organizations, community \
agencies, training programs, and other professionals committed to effective behavioral health care.

Our training is designed for providers working with people who experience intense emotions, high-risk \
behaviors, suicidality, complex behavioral health concerns, and the many challenges that can make daily life \
feel difficult or unmanageable.

We welcome learners across geographic locations-world wide, practice settings, and resource levels. Whether a \
team is building a DBT program, strengthening an established service, or deepening individual clinical \
skills, White Crane offers learning that is clinically grounded and immediately useful."""

HOW_WE_WORK = """\
Our work is guided by the central dialectic of DBT: acceptance and change can both be true, necessary, and \
possible.

We value fidelity to the essential elements of evidence-based treatment while partnering creatively with \
providers and organizations to meet the realities of their setting. We believe implementation is strongest \
when teams can be honest about their resources, challenges, and goals—and when learning is supported by \
consultation, collaboration, and ongoing practice.

We teach in the way we hope clinicians will practice: with clarity, respect, curiosity, warmth, and confidence \
in people’s capacity to build lives worth living."""

# "What Guides Us": one commitment per line, its name ending at the first full stop.
VALUES = """\
Science in service of practice. We translate research into useful, clinically meaningful learning.
Fidelity with flexibility. We honor the essential principles and elements of DBT and related treatments while \
supporting thoughtful, responsible implementation.
Validation and compassion. We take suffering seriously, treat people with dignity, and hold hope for change.
Mindful presence. We value awareness, nonjudgment, and wise, effective action.
Collaboration and access. We believe high-quality training should be within reach wherever care is needed.
Integrity and stewardship. We use our resources responsibly and remain accountable to the clinicians, \
organizations, and communities we serve."""

ABOUT_CLOSING = """\
White Crane is building a connected learning community for clinicians and teams who want to provide care \
that is scientifically grounded, practically useful, and deeply humane."""

TRAINER_CREDENTIALS = """\
In collaboration with international experts in the dissemination and implementation of DBT, the following \
criteria were identified as requirements for providing DBT training services for the Missouri Department of \
Mental Health. All criteria must be met in order to be eligible to deliver training services.

1. Certified by the DBT-LBC in the delivery of individual DBT services for at least 2 years (see dbt-lbc.org \
for details).
2. Hold a license to practice as a Social Worker or Psychologist in their state of residence and be in good \
standing with the licensing board.
3. Successfully completed direct supervision in the training of all elements of comprehensive DBT according \
to the World DBT Association. Demonstrated ability to teach effectively (e.g., running skills groups, giving \
presentations, training workshops). Strong background in adult learning principles and workshop facilitation.
4. Active and ongoing participation on a DBT consultation team(s) for at least 5 years.
5. Active and ongoing delivery of comprehensive DBT psychotherapy to individual clients.

Important: No trainer should be hired or contracted who does not meet all of these standards. Should a \
contracted trainer fail to continue to meet these standards at any time, the contract should be \
discontinued."""

# (name, role / credentials, bio, photo_url) in display order. Empty bios are still awaited from the Board.
BOARD = [
    (
        "Hollie Granato",
        "President",
        """\
Hollie Granato received her doctorate from the University of Washington in 2016, where her work focused on \
addictive behaviors, sexual trauma, and emotion dysregulation. As an assistant professor in psychiatry at \
UCLA, she has extensively collaborated with the LA county department of mental health on implementing \
training for both CBT and DBT as well as improving dissemination and implementation of evidence-based \
practice within large state-wide systems.

Currently, Hollie serves as faculty at the University of Texas - Austin, where she supervises psychiatry \
residents and lectures on topics related to CBT and DBT. She also currently consults on two federally funded \
grants and mentors research students on projects related to DBT, suicide prevention, and LGBTQIA+ related \
topics. She is a licensed clinical psychologist and DBT board certified therapist in private practice, and \
her group practice, Verdant Mental Health, hosts a training program for post-doctoral students.""",
        "/team/hollie-granato.jpg",
    ),
    (
        "Randy Wolbert",
        "Vice President",
        """\
Randy Wolbert MSW, Zen Rōshi. Former DBT trainer and Consultant with Behavioral Tech, the dissemination \
organization established by DBT developer, Marsha Linehan. During this time he was involved with several \
large-scale implementations of DBT.

Prior to his role at Behavioral Tech, Wolbert worked for 25 years as the Clinical Director of InterAct of \
Michigan, a large outpatient public mental health organization.

Randy is also a Zen teacher and former Zen student of Marsha Linehan and Greg Mayers. He leads Zen \
mindfulness retreats in the US and internationally. In 2021 he received an appointment as a Zen Rōshi \
(Master).

He was previously a founding Board Member of the DBT-Linehan Board of Certification (2011-2019).""",
        None,
    ),
    (
        "Karen Shipley",
        "Secretary",
        """\
Dr. Karen Shipley is a licensed clinical psychologist with over three decades of experience providing \
psychotherapy, consultation, training, and clinical leadership across healthcare, organizational, and \
community settings in both the U.S. and Australia.

She is currently a member of the Office of Well-Being for the University of Missouri School of Medicine and \
MU Healthcare system. Dr. Shipley brings extensive experience in program development, clinical quality \
improvement, and healthcare consultation. She has worked with systems and interdisciplinary teams to \
strengthen behavioral health services while addressing systemic factors that contribute to clinician \
burnout, team functioning, and workforce strain.

Her work on clinician well-being bridges science and systems change, emphasizing that sustainable care \
requires both evidence-based individual strategies and organizational alignment. Dr. Shipley helps \
professionals reconnect with purpose and increase hope while also identifying structural practices that \
support long-term effectiveness in high-demand environments.

An experienced DBT therapist and member of the Missouri DBT consult team, Dr. Shipley is also the founder of \
Drishti Consulting & Psychotherapy LLC. Her clinical expertise includes complex and high-acuity populations \
across the lifespan, including individuals experiencing pervasive emotion dysregulation, chronic \
suicidality, trauma, addiction, and grief.

Dr. Shipley values a life grounded in authenticity, reflection, and connection, aligning her personal \
practices with her professional principles.""",
        "/team/karen-shipley.jpg",
    ),
    (
        "Katrina Nguyen",
        "Treasurer",
        """\
Katrina J. Nguyen brings more than twenty years of experience in higher education administration and \
business coaching to White Crane's board. She holds an MBA (summa cum laude) and a B.S. in Psychology (magna \
cum laude) from Southern Nazarene University. She worked there for nearly two decades, first in records and \
payroll and later as Lead Academic Advisor, where she supervised staff and supported re-accreditation. She \
later helped run a grant-funded program for adult learners. She has taught as an adjunct professor since \
2009. Since 2020, she has coached highly sensitive entrepreneurs and leaders in business planning, \
marketing, and nervous system regulation. Katrina brings strengths in organization, business systems, and \
steady follow-through to her role as Treasurer.""",
        "/team/katrina-nguyen.jpg",
    ),
]

TRAINERS = [
    (
        "Rachel Downing",
        "LCSW",
        """\
Rachel Downing is a Licensed Clinical Social Worker who has provided Dialectical Behavior Therapy (DBT) \
since 2009. She began her DBT training in Kansas City in 2008 and earned her Master of Social Work from the \
University of Kansas in 2009. She has been certified by the DBT-Linehan Board of Certification since 2021.

Rachel treats adolescents and adults with borderline personality disorder, depression, anxiety, PTSD, and \
other mood disorders. Since 2023, she has trained clinicians in individual DBT, DBT skills training, and \
suicide assessment and management. Her training style is warm and approachable, and she uses personal and \
professional examples to bring the material to life. She is a lifelong learner who values continuous growth \
over perceived perfection.

Born and raised in Africa, Rachel loves to travel the world.""",
        "/team/rachel-downing.jpg",
    ),
    (
        "Caleb Reese",
        "PsyD",
        """\
Caleb S Reese, PsyD, is a Missouri-based licensed clinical psychologist and a DBT-Linehan Board of \
Certification, Certified Clinician™. He is authorized through PSYPACT to provide interjurisdictional \
telepsychology. He owns Pathless Journey LLC in St. Louis, where he specializes in comprehensive dialectical \
behavior therapy (DBT) for adults experiencing suicidal thoughts and behaviors, nonsuicidal self-injury, and \
significant emotion dysregulation.

Caleb brings more than 20 years of behavioral health experience across forensic inpatient hospitals, \
subacute care, intensive outpatient programs, community mental health, and private practice. He has trained \
clinicians since 2016 and provided comprehensive DBT training since 2022. His teaching connects theory with \
practice, emphasizing acceptance and change, mindfulness, validation, and behavioral shaping. With \
directness, compassion, and humor, Caleb helps clinicians apply DBT while maintaining adherence. \
Participants can expect clinical examples, skills practice, and collaborative discussion, with room for \
questions and curiosity. His goal is for clinicians at every experience level to leave with ideas they can \
use in their work with clients.

He earned his BS from Loyola University Chicago, MA from Pepperdine University, and PsyD from Pacific \
University in Oregon. He completed his APA-accredited predoctoral internship at Saint Elizabeths Hospital in \
Washington, DC. His graduate research explored voluntarily transient young adults and community factors \
related to revocation among youthful offenders. He is a member of the Society of Clinical Psychology (APA \
Division 12), the St. Louis Psychological Association, and the Missouri Psychological Association. He has \
been a formal Zen student since 2021.""",
        "/team/caleb-reese.jpg",
    ),
    (
        "Diana Hughes",
        "MS, LCP, NCC, DBT-LBC",
        """\
Diana Hughes is a Licensed Clinical Professional Counselor (LCP), National Certified Counselor (NCC), and \
DBT-LBC with a passion for making mental health education practical, engaging, and applicable to everyday \
life. She has co-led adult group skills trainings since 2019 and has presented at Parenting Summits on \
adolescents and mental health. She has also provided in-house training on multicultural counseling, \
bringing an emphasis on cultural humility and meaningful connection to her teaching.

A former middle and high school teacher, Diana brings an interactive, experiential approach to training. Her \
teaching philosophy is rooted in the same principle she used when teaching Spanish: if you want to see a \
change, you have to take new knowledge and apply it to your everyday life. She encourages participants to \
actively engage with the material, practice new skills, and consider how they can incorporate what they \
learn beyond the training room. And if there is an opportunity to work in a Mexican idiom or saying, she \
will absolutely take it—so participants may leave with a little extra Spanish, too!

Diana is a member of the National Board of Certified Counselors, American Counseling Association, and \
National Latino Behavioral Health Association. Her professional interests include DBT, adolescent mental \
health, cross cultural counseling, and skills-based approaches to mental health.

Outside of work, her soul is fed by telenovelas, Fridays are reserved for Latin dancing with her husband, \
and Otomí embroidery helps keep her grounded.""",
        "/team/diana-hughes.jpg",
    ),
    ("Jeff Brenneman", "", "", None),
]

# 2026-2027 trainings, from "2026-2027 Trainings.docx" (White Crane Training Collaborative Trainings and
# Registration). The schedule gives days but no times, so each runs 00:00 on its first day to 23:59 on its
# last: it stays listed through the final day, and the site shows the dates text, never those times.
# Spring 2027 is "Hold the Date": upcoming until the Board sends the registration links.
# (slug, title, status, dates as shown, first day, last day, registration URL)
TRAININGS = [
    ("suicide-assessment-nov-2026", "Taking the Guesswork out of Suicide Assessment and Intervention", "open",
     "Nov 18, 19, & 20, 2026", "2026-11-18", "2026-11-20", "https://cvent.me/QZQ7D5"),
    ("dbt-skills-training-dec-2026", "DBT Skills Training", "open",
     "Dec 15, 16, & 17, 2026", "2026-12-15", "2026-12-17", "https://cvent.me/eLPVPb"),
    ("intro-to-dbt-jan-2027", "Introduction to DBT: Making it Work in our Communities", "upcoming",
     "Jan 19, 20, 28, & 29, 2027", "2027-01-19", "2027-01-29", None),
    ("dbt-basics-feb-2027", "DBT Basics: Individual DBT-Based Psychotherapy", "upcoming",
     "Feb 17, 18, & 19, 2027", "2027-02-17", "2027-02-19", None),
    ("suicide-assessment-mar-2027", "Taking the Guesswork out of Suicide Assessment and Intervention", "upcoming",
     "Mar 23, 24, & 25, 2027", "2027-03-23", "2027-03-25", None),
    ("dbt-skills-training-apr-2027", "DBT Skills Training", "upcoming",
     "Apr 4, 5, & 6, 2027", "2027-04-04", "2027-04-06", None),
]  # fmt: skip

# Resources page, from "Resources List.docx" (November 2026). Documents are served by the web app from
# apps/web/public/downloads; the list's bare domains (Behaviortech.org etc.) are given https://.
# Still awaited: the Orientation Workbook, which arrived only as an Apple Pages file.
# (title, description, category, url)
RESOURCES = [
    # Links to documents
    ("Fidelity Measure (Program Self-Study)", "A self-evaluation of how closely a DBT program follows the model.",
     "for_teams", "/downloads/dbt-program-fidelity-self-evaluation.pdf"),
    ("Example Treatment Manual", "An exemplar DBT program manual to adapt for your own program.",
     "for_teams", "/downloads/dbt-program-manual-exemplar.pdf"),
    ("Individual Psychotherapy Progress Note Template", "Progress note for individual DBT sessions.",
     "forms", "/downloads/dbt-individual-therapy-note-template.docx"),
    ("Skills Training Progress Note Template", "Fillable note for DBT skills training sessions.",
     "forms", "/downloads/dbt-skills-training-session-note.pdf"),
    ("Coaching Note Template", "Fillable note for between-session coaching contacts.",
     "forms", "/downloads/dbt-coaching-contact-note.pdf"),
    ("Diary Card", "White Crane's DBT diary card.",
     "forms", "/downloads/white-crane-dbt-diary-card.docx"),
    ("Consultation Team Minutes", "Fillable minutes for DBT consultation team meetings.",
     "for_teams", "/downloads/dbt-consultation-team-minutes.pdf"),
    ("Observer Checklists", "Checklist for the observer role on a DBT consultation team.",
     "for_teams", "/downloads/consultation-team-observer-checklist.docx"),
    # Links to other websites
    ("Additional Training and Consultation Services", "Behavioral Tech (Behaviortech.org).",
     "links", "https://behaviortech.org/"),
    ("National DBT Certification", "DBT-Linehan Board of Certification (DBT-LBC.org).",
     "links", "https://dbt-lbc.org/"),
    ("ISITDBT", "", "links", "https://isitdbt.net/"),
    ("National BPD Alliance", "", "links", "https://bpdalliance.org/"),
    ("Empty Cloud Sangha (Zen/Mindfulness)", "", "links", "https://emptycloudsangha.org/"),
    ("DBT RU Skills Videos", "DBT skills videos on YouTube.", "links", "https://www.youtube.com/c/DBTRU/videos"),
    ("What is DBT?", "Article.", "reading", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2963469/"),
    ("Psychwire", "Free resources from Marsha Linehan.", "links", "https://psychwire.com/free-resources/linehan"),
    # Added at the client's request (November 2026)
    ("World DBT Association", "", "links", "https://wdbta.org/wdbta-mission/"),
    ("DBT North American and Caribbean Region (DBTNACRA)", "", "links", "https://www.dbtnacra.com/"),
    ("The Health Resiliency Institute", "", "links", "https://healthresiliencyinstitute.org/"),
    # Suicide / self-harm
    ("CDC Fast Facts", "Suicide statistics.", "suicide", "https://www.cdc.gov/nchs/fastats/suicide.htm"),
    ("Safety Planning", "Video on YouTube.", "suicide", "https://www.youtube.com/watch?v=f4dYmWxAK_Q"),
    ("World Health Organization", "Suicide rates.", "suicide",
     "https://www.who.int/data/gho/data/themes/mental-health/suicide-rates"),
    ("American Foundation for Suicide Prevention", "Suicide statistics.", "suicide",
     "https://afsp.org/suicide-statistics/"),
    ("The Trevor Project", "", "suicide", "https://www.thetrevorproject.org/"),
    ("The Suicide Prevention Resource Center", "Suicide data.", "suicide",
     "https://sprc.org/about-suicide/suicide-data/"),
    ("National Institute of Mental Health", "Suicide statistics.", "suicide",
     "https://www.nimh.nih.gov/health/statistics/suicide"),
]  # fmt: skip
