import { toFixed } from '@Utils/NumString';
import { round } from '@Utils/NumString/stringArithmatics';
import { Display } from '@Views/Common/Tooltips/Display';
import { RowBetween } from '@Views/TradePage/Components/Row';
import {
  BuyTradeDescText,
  BuyTradeHeadText,
} from '@Views/TradePage/Components/TextWrapper';
import { useActiveMarket } from '@Views/TradePage/Hooks/useActiveMarket';
import { limitOrderStrikeAtom, tradeTypeAtom } from '@Views/TradePage/atoms';
import { marketsForChart } from '@Views/TradePage/config';
import { joinStrings } from '@Views/TradePage/utils';
import { setDoccumentTitle } from '@Views/TradePage/utils/setDocumentTitle';
import styled from '@emotion/styled';
import { Trans } from '@lingui/macro';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

export const CurrentPriceBackground = styled.div`
  margin-top: 7px;
`;

export const CurrentPrice: React.FC<{
  price: string;
}> = ({ price }) => {
  const { activeMarket } = useActiveMarket();
  const [tradeType] = useAtom(tradeTypeAtom);

  const chartMarket =
    marketsForChart[
      joinStrings(
        activeMarket?.token0 ?? '',
        activeMarket?.token1 ?? '',
        ''
      ) as keyof typeof marketsForChart
    ];
  const precisePrice = toFixed(
    price,
    chartMarket.price_precision.toString().length - 1
  );
  const title = price ? precisePrice + ' | ' + chartMarket.tv_id : '';
  setDoccumentTitle(title);
  const precision = chartMarket.price_precision.toString().length - 1;
  return (
    <CurrentPriceBackground>
      <RowBetween>
        <BuyTradeHeadText>
          <Trans>Price</Trans>
        </BuyTradeHeadText>
        {tradeType == 'Market' ? (
          <BuyTradeDescText>
            <Display
              data={round(price, precision)}
              precision={precision}
              className="!py-[1px]"
            />
          </BuyTradeDescText>
        ) : (
          <StrikePricePicker
            initialStrike={round(price, precision)}
            precision={precision}
          />
        )}
      </RowBetween>
    </CurrentPriceBackground>
  );
};

const StrikePricePicker: React.FC<any> = ({
  initialStrike,
  precision,
}: {
  initialStrike: string;
  precision: number;
}) => {
  const [strike, setStrike] = useAtom(limitOrderStrikeAtom);
  useEffect(() => {
    console.log(`CurrentPrice-initialStrike: `, initialStrike);
    setStrike(initialStrike);
  }, []);
  return (
    <BuyTradeDescText className=" flex justify-end w-fit">
      <input
        type="number"
        pattern="^\d*(\.\d{0,2})?$"
        // min={0.001}
        className=" bg-[#282B39] !text-right px-[1px] py-[1px] rounded-sm w-[70%] outline-none"
        value={strike}
        onChange={(e) => {
          setStrike(round(e.target.value, precision));
        }}
      />
    </BuyTradeDescText>
  );
};
