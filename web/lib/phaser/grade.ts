import type { CardGrade } from "@/lib/domain/tutorial/content";

export const GRADE_COLOR: Record<CardGrade, number> = {
  gold: 0xe6b325,
  silver: 0xb9bfc4,
  bronze: 0xa8703f,
};

export const GRADE_COLOR_HEX: Record<CardGrade, string> = {
  gold: "#e6b325",
  silver: "#b9bfc4",
  bronze: "#a8703f",
};

export const GRADE_LABEL: Record<CardGrade, string> = {
  gold: "골드",
  silver: "실버",
  bronze: "브론즈",
};
