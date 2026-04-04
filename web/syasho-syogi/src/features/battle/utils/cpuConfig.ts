export const CPU_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type CpuDifficultyLevel = (typeof CPU_LEVELS)[number];

export const DEFAULT_CPU_LEVEL: CpuDifficultyLevel = 1;
export const CPU_OPPONENT_NAME = "CPU";
export const CPU_BOSS_NAME = "KCEO";
export const CPU_BOSS_IMAGE_SRC = import.meta.env.BASE_URL + "characters/kceo.png";

export function clampCpuLevel(value: unknown): CpuDifficultyLevel {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isInteger(numeric)) return DEFAULT_CPU_LEVEL;
  if (numeric < CPU_LEVELS[0]) return CPU_LEVELS[0];
  if (numeric > CPU_LEVELS[CPU_LEVELS.length - 1]) {
    return CPU_LEVELS[CPU_LEVELS.length - 1];
  }

  return numeric as CpuDifficultyLevel;
}
