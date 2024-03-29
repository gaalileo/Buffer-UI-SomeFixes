import FailedSuccessIcon from '@Assets/Elements/FailedSuccess';
import SuccessIcon from '@Assets/Elements/SuccessIcon';
import FailureIcon from '@SVG/Elements/FailureIcon';
import { divide, gt, subtract } from '@Utils/NumString/stringArithmatics';
import { toLangKey } from '@Utils/langUtils';
import { BetState } from '@Views/AboveBelow/Hooks/useAheadTrades';
import {
  IGQLHistory,
  expiryPriceCache,
} from '@Views/AboveBelow/Hooks/usePastTradeQuery';
import NumberTooltip from '@Views/Common/Tooltips';
import { useTranslation } from 'react-i18next';

export const PayoutChip: React.FC<{
  data: IGQLHistory;
  className?: string;
}> = ({ data, className = '' }) => {
  const { t } = useTranslation();
  const net_pnl = data.payout
    ? divide(subtract(data.payout, (data.totalFee ?? '0') as string), 18)
    : divide(subtract('0', (data.totalFee ?? '0') as string), 18);

  const isPending = data.state === BetState.active;
  let isWin = gt(net_pnl as string, '0');
  const isCancelled = data.state === BetState.cancelled;
  const isQueued = data.state === BetState.queued;

  let betExpiryPrice = expiryPriceCache?.[data.optionID as string];

  if (isPending && betExpiryPrice) {
    if (data.isAbove) {
      isWin = gt(betExpiryPrice, data.strike);
    } else {
      isWin = !gt(betExpiryPrice, data.strike);
    }
  }

  function getChipContent() {
    if (isPending && !betExpiryPrice) {
      return {
        tooltip: t('fetching-latest-states-0'),
        chip: t('fetching-state'),
        icon: (
          <img src="/Gear.png" className="transition-transform animate-spin" />
        ),
        textColor: 'text-3',
      };
    }
    if (isQueued)
      return {
        tooltip: t('the-trade-is-queued'),
        chip: t('queued'),
        icon: (
          <img src="/Gear.png" className="transition-transform animate-spin" />
        ),
        textColor: 'text-3',
      };
    if (isCancelled)
      return {
        tooltip: t('the-trade-is-cancelled'),
        chip: t('cancelled'),
        icon: <FailureIcon width={14} height={14} />,
        textColor: 'text-3',
      };
    if (isWin) {
      if (isPending)
        return {
          tooltip: t('you-won-the-trade-transfering-the-amount'),
          chip: t('processing-1'),
          icon: (
            <img
              src="/Gear.png"
              className="transition-transform animate-spin"
            />
          ),
          textColor: 'text-green',
        };
      else
        return {
          tooltip: t('you-won-this-bet'),
          chip: t('win'),
          icon: <SuccessIcon width={14} height={14} />,
          textColor: 'text-green',
        };
    } else
      return {
        tooltip: t('you-lost-this-trade'),
        chip: t('loss'),
        icon: <FailedSuccessIcon width={14} height={14} />,
        textColor: 'text-red',
      };
  }

  // if (data.state === BetState.active) {
  //   return null;
  // }
  return (
    <NumberTooltip content={getChipContent().tooltip}>
      <div
        className={`flex sm:flex-row-reverse items-center justify-between w-max web:pl-3 web:pr-[6px] web:py-2 web:bg-2 rounded-[5px] ${className}`}
      >
        <div
          className={
            'text-f13 font-normal web:mr-3 tab:mx-2' +
            ` ${getChipContent().textColor}`
          }
        >
          {getChipContent().chip}
        </div>

        {getChipContent().icon}
      </div>
    </NumberTooltip>
  );
};
