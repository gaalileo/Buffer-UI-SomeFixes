import { IMarket, IToken } from '..';
import { BetState, TradeInputs, useAheadTrades } from '@Hooks/useAheadTrades';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { usePastTradeQueryByFetch } from './usePastTradeQueryByFetch';
import axios from 'axios';
import { expiryPriceCache } from './useTradeHistory';
import { useUserAccount } from '@Hooks/useUserAccount';
import { useActiveChain } from '@Hooks/useActiveChain';
import { divide, multiply } from '@Utils/NumString/stringArithmatics';
import { useAugmentedTrades } from './useAugmentedTrades';

export const tardesAtom = atom<{
  active: IGQLHistory[];
  history: IGQLHistory[];
  cancelled: IGQLHistory[];
}>({
  active: null,
  history: null,
  cancelled: null,
});
export const tardesPageAtom = atom<{
  active: number;
  history: number;
  cancelled: number;
}>({
  active: 1,
  history: 1,
  cancelled: 1,
});
export const tardesTotalPageAtom = atom<{
  active: number;
  history: number;
  cancelled: number;
}>({
  active: 1,
  history: 1,
  cancelled: 1,
});
export const updateTotalPageNumber = atom(null, (get, set, update) => {
  set(tardesTotalPageAtom, update);
});
export const updateActivePageNumber = atom(null, (get, set, update: number) => {
  set(tardesPageAtom, { ...get(tardesPageAtom), active: update });
});
export const updateHistoryPageNumber = atom(
  null,
  (get, set, update: number) => {
    set(tardesPageAtom, { ...get(tardesPageAtom), history: update });
  }
);
export const updateCancelledPageNumber = atom(
  null,
  (get, set, update: number) => {
    set(tardesPageAtom, { ...get(tardesPageAtom), cancelled: update });
  }
);

// {
//   1: 'active'
//   2: 'exercised'
//   3: 'expired'
//   4: 'queued',
//   5:cancelled
// }

const TRADESINAPAGE = 10;
export interface IGQLHistory {
  strike: string;
  totalFee: string;
  state: BetState;
  depositToken: string | IToken;
  isAbove: boolean;
  optionContract: {
    asset: string;
    address: string;
  };
  amount?: string;
  creationTime?: string;

  expirationPrice?: string;
  expirationTime?: string;
  payout?: string;
  queueID?: string;
  optionID?: string;
  reason?: string;
  user: {
    address: string;
  };
  slippage?: string;
  //added on FE
  configPair?: IMarket;
  blockNumber?: number;
}

export const useProcessedTrades = () => {
  const { configContracts } = useActiveChain();
  const getProcessedTrades = (
    trades,
    block,
    tradesToBeDeleted?: TradeInputs[],
    shouldAddHistoryPrice = false
  ) => {
    const tempTrades = trades?.map((singleTrade: IGQLHistory) => {
      // console.log(singleTrade, 'singleTrade');
      // if (singleTrade.blockNumber) {
      //   if (block >= singleTrade.blockNumber) {
      //     // if graph scanned this block.
      //     return null;
      //   }
      // }
      // if (tradesToBeDeleted?.length) {
      //   if (
      //     tradesToBeDeleted.find(
      //       (singleRawTrade) =>
      //         singleRawTrade.id == +singleTrade.queueID &&
      //         singleTrade.state === BetState.queued
      //     )
      //   ) {
      //     return null;
      //   }
      // }
      let pool;
      const configPair = configContracts.pairs.find((pair) => {
        pool = pair.pools.find(
          (pool) =>
            pool.options_contracts.current.toLocaleLowerCase() ===
            singleTrade.optionContract.address.toLowerCase()
        );
        return !!pool;
      });
      if (!pool) return null;

      const depositToken = configContracts.tokens[pool.token];
      let updatedTrade = { ...singleTrade, depositToken, configPair };
      if (shouldAddHistoryPrice) {
        addExpiryPrice(updatedTrade);
      }

      return updatedTrade;
    });
    // filter out not-null bets.
    tempTrades?.filter((t) => {
      if (t) {
        return true;
      }
      return false;
    });

    return tempTrades;
  };
  return { getProcessedTrades };
};

export const addExpiryPrice = async (currentTrade: IGQLHistory) => {
  if (
    currentTrade.state === BetState.active &&
    !expiryPriceCache?.[currentTrade.optionID]
  ) {
    // console.log(`[augexp]currentTrade: `, currentTrade);
    axios
      .post(`https://oracle.buffer-finance-api.link/price/query/`, [
        {
          pair: currentTrade.configPair.tv_id,
          timestamp: currentTrade.expirationTime,
        },
      ])
      .then((response) => {
        console.log(`response[fetch]: `, response);
        if (
          !expiryPriceCache[currentTrade.optionID] &&
          response?.data?.[0]?.price
        )
          expiryPriceCache[currentTrade.optionID] =
            response?.data?.[0].price.toString();
      });
  }
};

export const usePastTradeQuery = () => {
  const { address: account } = useUserAccount();
  const { getProcessedTrades } = useProcessedTrades();
  const setTrades = useSetAtom(tardesAtom);
  const setPageNumbers = useSetAtom(updateTotalPageNumber);
  const { active, history, cancelled } = useAtomValue(tardesPageAtom);
  const activePage = useMemo(() => TRADESINAPAGE * (active - 1), [active]);
  const historyPage = useMemo(() => TRADESINAPAGE * (history - 1), [history]);
  const cancelledPage = useMemo(
    () => TRADESINAPAGE * (cancelled - 1),
    [cancelled]
  );

  const { data: remoteData } = usePastTradeQueryByFetch({
    account: account,
    historyskip: historyPage,
    historyfirst: TRADESINAPAGE,
    activeskip: activePage,
    activefirst: TRADESINAPAGE,
    cancelledskip: cancelledPage,
    cancelledfirst: TRADESINAPAGE,
    currentTime: Math.floor(new Date().getTime() / 1000),
  });

  const blockNumber = remoteData?._meta?.block.number;
  // const { data: trades } = useAheadTrades(data, account, false);
  const { data } = useAugmentedTrades(remoteData);
  console.log(`data: `, data);
  useEffect(() => {
    let activeResponseArr = [];
    if (!data) return;
    activeResponseArr = data?.queuedTrades;
    activeResponseArr = [...activeResponseArr, ...data.activeTrades];

    activeResponseArr = getProcessedTrades(activeResponseArr, blockNumber, []);

    let historyResponseArr = data?.historyTrades;
    let cancelledResponseArr = data?.cancelledTrades;
    cancelledResponseArr = getProcessedTrades(
      cancelledResponseArr,
      blockNumber
    );

    if (historyResponseArr?.length) {
      historyResponseArr = [...data?.historyTrades];
    }
    historyResponseArr = getProcessedTrades(
      historyResponseArr,
      blockNumber,
      null,
      true
    );

    setTrades({
      active: activeResponseArr?.filter((a) => a),
      history: historyResponseArr?.filter((a) => a),
      cancelled: cancelledResponseArr?.filter((a) => a),
    });
    if (data?.activeLength)
      setPageNumbers({
        active: Math.ceil(data.activeLength.length / TRADESINAPAGE),
        history: Math.ceil(data.historyLength.length / TRADESINAPAGE),
        cancelled: Math.ceil(data.cancelledLength.length / TRADESINAPAGE),
      });
    else
      setPageNumbers({
        active: 0,
        history: 0,
        cancelled: 0,
      });
  }, [
    data?.historyTrades,
    data?.activeTrades,
    data?.queuedTrades,
    data?.cancelledTrades,
    data?._meta,
    data?.activeLength,
    data?.historyLength,
    data?.cancelledLength,
    account,
  ]);
};
