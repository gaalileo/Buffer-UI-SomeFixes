import { ArbitrumOnly } from '@Views/Common/ChainNotSupported';
import { Section } from '@Views/Earn/Components/Section';
import { IReferralStat } from '@Views/Referral';
import { useUserReferralStats } from '@Views/Referral/Hooks/useUserReferralStats';
import { useProfileGraphQl2 } from '../../Hooks/useProfileGraphQl2';
import { Referral } from './ReferralCard';
import { TradingCardV2 } from './TradingCardV2';
import { useTranslation } from 'react-i18next';

export const ProfileCardsV2 = () => {
  const { t } = useTranslation();
  const metrics = useProfileGraphQl2();
  const { data }: { data?: IReferralStat; } = useUserReferralStats();
  return (
    <Section
      Heading={<div className="text-f22">{t('metrics')}</div>}
      subHeading={<></>}
      Cards={[
        <Referral data={data} heading={t('referral-metrics')} />,
        <TradingCardV2
          data={metrics?.['USDC']}
          heading={t('usdc-trading-metrics')}
          tokenName="USDC"
        />,
        <ArbitrumOnly hide>
          <TradingCardV2
            data={metrics?.['ARB']}
            heading={t('arb-trading-metrics')}
            tokenName="ARB"
          />
        </ArbitrumOnly>,
        <ArbitrumOnly hide>
          <TradingCardV2
            data={metrics?.['BFR']}
            heading={t('bfr-trading-metrics')}
            tokenName="BFR"
          />
        </ArbitrumOnly>,
      ]}
      className="!mt-7"
    />
  );
};
