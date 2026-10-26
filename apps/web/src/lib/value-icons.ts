import { FlaskConical, Flower2, HeartHandshake, Scale, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react'

/** Icon for a value, picked from its name; falls back to a sparkle for values added later. */
const VALUE_ICONS: [RegExp, LucideIcon][] = [
  [/science|research/i, FlaskConical],
  [/fidelity/i, Scale],
  [/validation|compassion/i, HeartHandshake],
  [/mindful/i, Flower2],
  [/collaborat|access/i, Users],
  [/integrity|stewardship/i, ShieldCheck],
]

export const valueIcon = (lead: string): LucideIcon => VALUE_ICONS.find(([re]) => re.test(lead))?.[1] ?? Sparkles
