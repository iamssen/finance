import type { WeeklyBody } from '@iamssen/exocortex';
import { OPTIMAL_CALORIES } from '@ui/env';
import styles from '../styles.module.css';

export function rowClass({ avgDayKcal }: WeeklyBody): string | null {
  return avgDayKcal && avgDayKcal < OPTIMAL_CALORIES
    ? styles.gridRowUnimportant
    : null;
}
