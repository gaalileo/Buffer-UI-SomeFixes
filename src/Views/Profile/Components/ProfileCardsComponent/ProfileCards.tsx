import { ArbitrumOnly } from '@Views/Common/ChainNotSupported';
import { Section } from '@Views/Earn/Components/Section';
import { useProfileGraphQl } from '@Views/Profile/Hooks/useProfileGraphQl';
import { IReferralStat } from '@Views/Referral';
import { useUserReferralStats } from '@Views/Referral/Hooks/useUserReferralStats';
import { Referral } from './ReferralCard';
import { Trading } from './TradingCard';
import { useTranslation } from 'react-i18next';

export const profileCardClass = 'rounded-lg px-7 !border-none';

export const ProfileCards = () => {
  const { tradingMetricsData } = useProfileGraphQl();
  const { data }: { data?: IReferralStat; } = useUserReferralStats();
  const { t } = useTranslation();
  return (
    <Section
      Heading={<div className="text-f22">{t('metrics')}</div>}
      subHeading={<></>}
      Cards={[
        <Referral data={data} heading={t('referral-metrics')} />,
        <Trading
          data={tradingMetricsData}
          heading={t('usdc-trading-metrics')}
          tokenName="USDC"
        />,
        <ArbitrumOnly hide>
          <Trading
            data={tradingMetricsData}
            heading={t('arb-trading-metrics')}
            tokenName="ARB"
          />
        </ArbitrumOnly>,
        <ArbitrumOnly hide>
          <Trading
            data={tradingMetricsData}
            heading={t('bfr-trading-metrics')}
            tokenName="BFR"
          />
        </ArbitrumOnly>,
      ]}
      className="!mt-7"
    />
  );
};
