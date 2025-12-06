import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { TradeHistoryPage } from './TradeHistoryPage.tsx';
import { TradesListPage } from './TradesListPage.tsx';

export function TradesPage(): ReactNode {
  return (
    <Routes>
      <Route index Component={TradesListPage} />
      <Route
        path="us"
        element={
          <TradeHistoryPage
            portfolio="us"
            currency="USD"
            benchmarkSymbol="SPY"
          />
        }
      />
      <Route
        path="kr"
        element={
          <TradeHistoryPage
            portfolio="kr"
            currency="KRW"
            benchmarkSymbol="SPY"
            printDisplayName
          />
        }
      />
      <Route
        path="jp"
        element={
          <TradeHistoryPage
            portfolio="jp"
            currency="JPY"
            benchmarkSymbol="SPY"
            printDisplayName
          />
        }
      />
      <Route
        path="fx"
        element={
          <TradeHistoryPage
            portfolio="fx"
            currency="KRW"
            benchmarkSymbol="SPY"
          />
        }
      />
      <Route
        path="crypto"
        element={
          <TradeHistoryPage
            portfolio="crypto"
            currency="USD"
            benchmarkSymbol="SPY"
          />
        }
      />
    </Routes>
  );
}
