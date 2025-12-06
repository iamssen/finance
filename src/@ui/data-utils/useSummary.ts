import type {
  ExpiryData,
  JoinedFX,
  JoinedHoldings,
  JPY,
  KRW,
  Portfolio,
  PortfolioSummary,
  Quote,
  USD,
} from '@iamssen/exocortex';
import {
  createSummary,
  getStableCoinMarketValue,
  joinFxAndQuote,
  joinHoldingsAndQuotes,
} from '@iamssen/exocortex/projector';
import { useQuery } from '@tanstack/react-query';
import { api } from '@ui/query';
import { useMemo } from 'react';
import { createSimulation } from './createSimulation.ts';
import type { OtherCurrencyBalances } from './useOtherCurrenciesBalances.ts';
import { useOtherCurrenciesBalances } from './useOtherCurrenciesBalances.ts';
import { useQuotes } from './useQuotes.ts';

export interface SummaryValue {
  financeData: Portfolio | undefined;
  usdkrw: ExpiryData<Quote> | undefined;
  jpykrw: ExpiryData<Quote> | undefined;
  quotes: Map<string, Quote>;

  fxUSD: JoinedFX<USD> | undefined;
  fxJPY: JoinedFX<JPY> | undefined;
  us: JoinedHoldings;
  kr: JoinedHoldings;
  jp: JoinedHoldings;
  crypto: JoinedHoldings;
  summary: ExtendedSummary | undefined;

  otherCurrencies: OtherCurrencyBalances[];
  otherCurrenciesTotalAmount: KRW;
}

export function useSummary(): SummaryValue {
  const { data: { data: financeData } = {} } = useQuery(api('portfolio'));

  const { data: usdkrw } = useQuery(api('finance/quote/KRW=X'));
  const { data: jpykrw } = useQuery(api('finance/quote/JPYKRW=X'));

  const otherCurrencies = useOtherCurrenciesBalances(
    financeData?.balances.others,
  );

  const symbols = useMemo(
    () => (financeData ? Object.keys(financeData.holdings.index) : []),
    [financeData],
  );

  const quotes = useQuotes(symbols);

  const us = useMemo(
    () => joinHoldingsAndQuotes(financeData?.holdings.us.list ?? [], quotes),
    [financeData?.holdings.us.list, quotes],
  );

  const kr = useMemo(
    () => joinHoldingsAndQuotes(financeData?.holdings.kr.list ?? [], quotes),
    [financeData?.holdings.kr.list, quotes],
  );

  const jp = useMemo(
    () => joinHoldingsAndQuotes(financeData?.holdings.jp.list ?? [], quotes),
    [financeData?.holdings.jp.list, quotes],
  );

  const crypto = useMemo(
    () =>
      joinHoldingsAndQuotes(financeData?.holdings.crypto.list ?? [], quotes),
    [financeData?.holdings.crypto.list, quotes],
  );

  const otherCurrenciesTotalAmount = useMemo(
    () => otherCurrencies.reduce((t, { krwAmount }) => t + krwAmount, 0) as KRW,
    [otherCurrencies],
  );

  const fxUSD = useMemo(
    () =>
      financeData
        ? joinFxAndQuote<USD>(
            financeData.fx.usd,
            financeData.balances.usd,
            undefined,
            financeData.bonds.us,
            usdkrw?.data,
          )
        : undefined,
    [financeData, usdkrw?.data],
  );

  const fxJPY = useMemo(
    () =>
      financeData
        ? joinFxAndQuote<JPY>(
            financeData.fx.jpy,
            financeData.balances.jpy,
            undefined,
            undefined,
            jpykrw?.data,
          )
        : undefined,
    [financeData, jpykrw?.data],
  );

  const summary = useMemo(() => {
    if (!usdkrw || !jpykrw || !financeData) {
      return undefined;
    }

    return createExtendedSummary(
      financeData,
      usdkrw.data,
      jpykrw.data,
      us,
      kr,
      jp,
      crypto,
      quotes,
      otherCurrenciesTotalAmount,
    );
  }, [
    crypto,
    financeData,
    jp,
    jpykrw,
    kr,
    otherCurrenciesTotalAmount,
    quotes,
    us,
    usdkrw,
  ]);

  return {
    financeData,
    usdkrw,
    jpykrw,
    quotes,
    fxUSD,
    fxJPY,
    us,
    kr,
    jp,
    crypto,
    summary,
    otherCurrencies,
    otherCurrenciesTotalAmount,
  };
}

export type ExtendedSummary = PortfolioSummary & {
  ingredients: {
    gold: number;
    krw: { riskless: any; cash: KRW; stocks: number };
    jpy: { cash: number; stocks: number };
    housing: KRW;
    purpose: {
      gold: number;
      krw: { riskless: number; cash: number; stocks: number };
      jpy: { cash: number; stocks: number };
      housing: number;
      usd: { riskless: number; cash: number; stocks: number };
      crypto: { coins: number; stable: number };
    };
    usd: { riskless: number; cash: number; stocks: number };
    crypto: { coins: number; stable: number };
  };
  simulates:
    | undefined
    | {
        jpy: number;
        totalGain: number;
        changeRisk: {
          riskAmount: number;
          totalGain: number;
          riskPercent: number;
          totalGainPercent: number;
          marketValue: number;
        }[];
        spyPrice: number;
        totalGainPercent: number;
        usd: number;
        name: string;
        marketValue: any;
        rise: number;
      }[];
};

function createExtendedSummary(
  financeData: Portfolio,
  usdkrw: Quote,
  jpykrw: Quote,
  us: JoinedHoldings,
  kr: JoinedHoldings,
  jp: JoinedHoldings,
  crypto: JoinedHoldings,
  quotes: Map<string, Quote>,
  otherCurrenciesTotalAmount: KRW,
): ExtendedSummary {
  const summary = createSummary(
    financeData,
    usdkrw,
    jpykrw,
    us,
    kr,
    jp,
    crypto,
    otherCurrenciesTotalAmount,
  );

  const usd = usdkrw.price as KRW;
  const jpy = jpykrw.price as KRW;

  const stableCoinMarketValue: USD = getStableCoinMarketValue(crypto.holdings);

  const ingredients = {
    usd: {
      cash: financeData.balances.usd.totalAmount * usd,
      riskless: financeData.bonds.us.totalPurchasePrice * usd,
      stocks: us.gain.marketValue * usd,
    },
    krw: {
      cash: financeData.balances.krw.totalAmount,
      riskless:
        financeData.deposits.kr.totalAmount +
        financeData.bonds.kr.totalPurchasePrice,
      stocks: kr.gain.marketValue,
    },
    jpy: {
      cash: financeData.balances.jpy.totalAmount * jpy,
      stocks: jp.gain.marketValue * jpy,
    },
    housing: financeData.housing.totalAmount,
    crypto: {
      stable: stableCoinMarketValue * usd,
      coins: (crypto.gain.marketValue - stableCoinMarketValue) * usd,
    },
    gold: 0,
    purpose: {
      usd: {
        cash: 5,
        riskless: 15,
        stocks: 45,
      },
      krw: {
        cash: 3,
        riskless: 4,
        stocks: 8,
      },
      jpy: {
        cash: 0.1,
        stocks: 0.9,
      },
      crypto: {
        stable: 0,
        coins: 2,
      },
      housing: 15,
      gold: 2,
    },
  };

  const simulate = createSimulation(
    financeData,
    summary.principal,
    us,
    kr,
    jp,
    crypto,
    quotes.get('SPY')?.price,
    usd,
    jpy,
  );

  return {
    ...summary,
    ingredients,
    simulates:
      simulate &&
      financeData.simulations.map((s) =>
        simulate(s.title, s.usdkrw, s.jpykrw, s.spy),
      ),
  };
}
