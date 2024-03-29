import LockIcon from '@SVG/Elements/LockIcon';
import { IGQLHistory } from '@Views/AboveBelow/Hooks/usePastTradeQuery';
import TableAssetCell from '@Views/Common/BufferTable/TableAssetCell';
import { PairTokenImage } from '@Views/Common/PairTokenImage';
import NumberTooltip from '@Views/Common/Tooltips';
import { UpDownChip } from '@Views/ABTradePage/Views/AccordionTable/UpDownChip';
import { useTranslation } from 'react-i18next';

export const AssetCell: React.FC<{
  currentRow: IGQLHistory;
  split?: boolean;
  platform?: boolean;
}> = ({ currentRow, split, platform }) => {
  const isHidden = currentRow.isAbove === undefined;
  const isUp = currentRow.isAbove;
  const token0 = currentRow.optionContract.token0;
  const token1 = currentRow.optionContract.token1;
  const { t } = useTranslation();
  return (
    <TableAssetCell
      img={
        <div className="w-[20px] h-[20px] mr-[6px] sm:w-[15px] sm:h-[15px] sm:mt-1 sm:mr-2">
          <PairTokenImage
            pair={{
              token0,
              token1,
            }}
          />
        </div>
      }
      head={
        <NumberTooltip
          content={
            platform || isHidden
              ? t('trade-directions-are-hidden')
              : t('you-chose') + " " + (isUp ? t('up') : t('down'))
          }
        >
          <div className={`flex  -ml-[6px]`}>
            <span className={`weight-400 text-f15 sm:text-f12 `}>
              {token0 + '-' + token1}{' '}
            </span>
            {isHidden || platform ? (
              <LockIcon />
            ) : (
              <UpDownChip
                isUp={isUp}
                shouldShowText={!split}
                  upText={t('above')}
                  downText={t('below')}
                shouldShowImage={split}
              />
            )}
          </div>
        </NumberTooltip>
      }
      desc={<></>}
    />
  );
};
