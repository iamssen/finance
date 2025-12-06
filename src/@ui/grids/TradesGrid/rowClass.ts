import type { JoinedTrade } from '@iamssen/exocortex';
import { clsx } from 'clsx/lite';
import styles from '../styles.module.css';
import component from './component.module.css';

export function rowClass({ trade, quote }: JoinedTrade): string | null {
  if (!quote) {
    return null;
  } else if (trade.price === 0) {
    return styles.gridRowUnimportant;
  }

  const diff =
    ((quote.price - trade.price) / trade.price) *
    100 *
    (trade.quantity < 0 ? -1 : 1);

  const className = clsx(
    trade.quantity < 0
      ? styles.gridRowNegative
      : quote.price > trade.price * 1.1
        ? styles.gridRowPositive
        : null,
    diff < -20
      ? component.superNegativeGain
      : diff < -2
        ? component.negativeGain
        : null,
  );

  return className;
}
