import type { WeeklyBody } from '@iamssen/exocortex';
import { EXCESS_CALORIES, SUPER_EXCESS_CALORIES } from '@ui/env';
import component from './component.module.css';

export function avgDayKcalClass({ avgDayKcal }: WeeklyBody): string | null {
  if (!avgDayKcal) {
    return null;
  }

  return avgDayKcal > SUPER_EXCESS_CALORIES
    ? component.gridCellSuperDanger
    : avgDayKcal > EXCESS_CALORIES
      ? component.gridCellDanger
      : null;
}

export const dayClass =
  (columnIndex: number) =>
  ({ dayKcals }: WeeklyBody): string | null => {
    const kcal = dayKcals[columnIndex]?.totalKcal ?? 0;
    return kcal > SUPER_EXCESS_CALORIES
      ? component.gridCellSuperDanger
      : kcal > EXCESS_CALORIES
        ? component.gridCellDanger
        : null;
  };
