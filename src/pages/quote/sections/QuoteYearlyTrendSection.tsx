import type { ExpiryData, QuoteHistory, QuoteInfo } from '@iamssen/exocortex';
import { createQuoteYearlyTrendChartData, YearlyTrendChart } from '@ui/charts';
import { type ReactNode, useMemo } from 'react';

export interface QuoteYearlyTrendSectionProps {
  info: QuoteInfo;
  historyData: ExpiryData<QuoteHistory> | undefined;
}

export function QuoteYearlyTrendSection({
  info,
  historyData,
}: QuoteYearlyTrendSectionProps): ReactNode {
  const data = useMemo(() => {
    return historyData?.data
      ? createQuoteYearlyTrendChartData({ history: historyData.data, info })
      : undefined;
  }, [historyData, info]);

  if (!data) {
    return null;
  }

  return (
    <YearlyTrendChart
      {...data}
      style={{
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
        height: 'max(20vh, 250px)',
      }}
    />
  );
}
