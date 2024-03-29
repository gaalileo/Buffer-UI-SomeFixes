import { Card } from '@Views/Earn/Components/Card';
import { profileCardClass } from './ProfileCards';
import { useTranslation } from 'react-i18next';

export const WalletNotConnectedCard = ({ heading }: { heading: string; }) => {
  const { t } = useTranslation();
  return <Card
    top={heading}
    middle={<div className="mt-3">{t('wallet-not-connected')}</div>}
    className={profileCardClass}
    shouldShowDivider={false}
  />;
};
