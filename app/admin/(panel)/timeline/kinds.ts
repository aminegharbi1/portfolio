import type { TimelineKind } from "@/generated/prisma/enums";

export const KIND_LABELS: Record<TimelineKind, string> = {
  EDUCATION: "Formation",
  EXPERIENCE: "Expérience",
  PROJECT: "Projet",
  CERTIFICATION: "Certification",
};
