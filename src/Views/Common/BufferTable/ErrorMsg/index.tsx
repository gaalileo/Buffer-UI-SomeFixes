import { useGlobal } from '@Contexts/Global';
import { PrimaryActionBtn } from '@Views/Common/Buttons';
import Background from './style';
import useOpenConnectionDrawer from '@Hooks/Utilities/useOpenConnectionDrawer';
import NoMatchFound from 'src/SVG/Elements/NoMatchFound';
import { useAccount } from 'wagmi';
import { useUserAccount } from '@Hooks/useUserAccount';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useTranslation } from 'react-i18next';
import { toLangKey } from '@Utils/langUtils';

interface ITableErrorMsg {
  msg: string;
  onClick: (e: any) => void;
  btn?: string;
  shouldShowWalletMsg?: boolean;
  calssName?: string;
}

const TableErrorMsg: React.FC<ITableErrorMsg> = ({
  msg,
  onClick,
  btn,
  calssName,
  shouldShowWalletMsg = true,
}) => {
  const { openConnectModal } = useConnectModal();

  const { address: account } = useUserAccount();
  const { dispatch } = useGlobal();
  const { openWalletDrawer } = useOpenConnectionDrawer();
  const connect = (e: any) => {
    dispatch({ type: 'SET_DRAWER', payload: true });
    openWalletDrawer();
  };
  const { t } = useTranslation();
  const errorMsg =
    shouldShowWalletMsg && !account ? "Wallet isn't connected" : msg;
  return (
    <Background className={`mt-5 ${calssName}`}>
      <NoMatchFound />
      {errorMsg}
      {btn && (
        <PrimaryActionBtn
          className={'button'}
          onClick={account ? onClick : openConnectModal}
        >
          {account ? t(toLangKey(btn)) : t('connect-wallet')}
        </PrimaryActionBtn>
      )}
    </Background>
  );
};

export default TableErrorMsg;
