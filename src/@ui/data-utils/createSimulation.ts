import type { JoinedHoldings, Portfolio } from '@iamssen/exocortex';

type CreateSimulation = (
  name: string,
  usd: number,
  jpy: number,
  spyPrice: number,
) => {
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
};

export const createSimulation: (
  financeData: Portfolio,
  principal: number,
  us: JoinedHoldings,
  kr: JoinedHoldings,
  jp: JoinedHoldings,
  crypto: JoinedHoldings,
  currentSPYPrice: number | undefined,
  currentUSDKRW: number,
  currentJPYKRW: number,
) => CreateSimulation | undefined = (
  financeData: Portfolio,
  principal: number,
  us: JoinedHoldings,
  kr: JoinedHoldings,
  jp: JoinedHoldings,
  crypto: JoinedHoldings,
  currentSPYPrice: number | undefined,
  currentUSDKRW: number,
  currentJPYKRW: number,
) => {
  return typeof currentSPYPrice === 'number'
    ? (name: string, usd: number, jpy: number, spyPrice: number) => {
        const rise = spyPrice / currentSPYPrice;

        const riskless =
          financeData.balances.krw.totalAmount +
          financeData.housing.totalAmount +
          financeData.balances.usd.totalAmount * usd +
          financeData.balances.jpy.totalAmount * jpy +
          financeData.deposits.kr.totalAmount +
          financeData.bonds.kr.totalPurchasePrice +
          financeData.bonds.us.totalPurchasePrice * usd;

        const risk =
          kr.gain.marketValue +
          us.gain.marketValue * usd +
          jp.gain.marketValue * jpy +
          crypto.gain.marketValue * usd;

        const marketValue = riskless + risk * rise;

        const totalGain = marketValue - principal;

        const totalGainPercent = (totalGain / principal) * 100;

        const changeRisk = [-0.1, 0.2, 0.3].map((increaseRisk) => {
          const currentRisk =
            kr.gain.marketValue +
            us.gain.marketValue * currentUSDKRW +
            jp.gain.marketValue * currentJPYKRW +
            crypto.gain.marketValue * currentUSDKRW;

          const riskAmount = currentRisk * increaseRisk;

          const increaseRiskMarketValue =
            riskless - riskAmount + (risk + riskAmount) * rise;

          const increaseRiskTotalGain = increaseRiskMarketValue - principal;

          const increaseRiskTotalGainPercent =
            (increaseRiskTotalGain / principal) * 100;

          return {
            riskPercent: increaseRisk * 100,
            riskAmount,
            marketValue: increaseRiskMarketValue,
            totalGain: increaseRiskTotalGain,
            totalGainPercent: increaseRiskTotalGainPercent,
          };
        });

        return {
          name,
          usd,
          jpy,
          rise,
          spyPrice,
          marketValue,
          totalGain,
          totalGainPercent,
          changeRisk,
        };
      }
    : undefined;
};
