import { useActiveChain } from '@Hooks/useActiveChain';
import { useUserAccount } from '@Hooks/useUserAccount';
import { ContentCopy } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import BufferLogo from '@Public/ComponentSVGS/bufferLogo';
import { ConnectionRequired } from '@Views/Common/Navbar/AccountDropdown';
import { BlueBtn } from '@Views/Common/V2-Button';
import { tabs } from '@Views/Referral';
import { useUserCode } from '@Views/Referral/Hooks/useUserCode';
import { affilateCode2ReferralLink } from '@Views/Referral/Utils/affiliateCode2RederralLink';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCopyToClipboard } from 'react-use';
import { useTranslation } from 'react-i18next';

export const ReferralLink = () => {
  const { viewOnlyMode } = useUserAccount();
  if (viewOnlyMode) return <></>;
  const { t } = useTranslation();

  return (
    <div className="rounded-lg px-7 py-5 bg-2 flex items-center justify-between mt-5 mb-[0] sm:flex-col sm:gap-6 sm:px-6 sm:py-6">
      {/* left side */}
      <div className="flex items-start gap-5">
        <BufferLogo height={60} width={60} />{' '}
        <div className="flex flex-col items-start justify-center ">
          <div className="text-f20 mt-2 sm:text-f16">
            {/* Invite your friends to use Buffer */}
            {t('invite')}
          </div>
          <div className="text-f14 sm:text-f12">
            {/* Get fee discounts and rebates!&nbsp; */}
            {t('rebates')}
            {/* <span
              className="light-blue-text  whitespace-nowrap hover:underline  cursor-pointer"
              onClick={() => {
                window.open('#', '_blank');
              }}
            >
              Learn more
              <FrontArrow className="tml w-fit inline" />
            </span> */}
          </div>
        </div>
      </div>

      {/* right side */}
      <Button />
    </div>
  );
};

const Button = () => {
  const { address: account } = useUserAccount();
  const [open, setOpen] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();
  const { hostname } = window.location;
  const { activeChain } = useActiveChain();
  const { affiliateCode } = useUserCode(activeChain);
  const navigate = useNavigate();
  const baseURL = `https://${hostname}/#/`;
  const link = !!affiliateCode
    ? affilateCode2ReferralLink(affiliateCode)
    : baseURL;
  const { t } = useTranslation();
  const copyLink = () => {
    try {
      copyToClipboard(link);
      setOpen(true);
    } catch (err) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setOpen(false);
      }, 4000);
    }
  }, [open]);
  // console.log(account, 'account');
  if (account === undefined) {
    return (
      <ConnectionRequired>
        <></>
      </ConnectionRequired>
    );
  }
  if (affiliateCode === null) {
    return (
      <BlueBtn
        onClick={() => navigate(`/referral?tab=${tabs[1]}`)}
        className="!w-fit px-5"
      >
        {t('create-referral-code')}
      </BlueBtn>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <Tooltip
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={t('copied')}
        placement="top"
        disableFocusListener
        disableHoverListener
        disableTouchListener
        classes={{
          tooltip: 'tooltip',
          arrow: 'arrow',
        }}
      >
        <button
          onClick={copyLink}
          className="bg-blue rounded-md text-f16 flex items-center gap-2 px-5 py-2 !w-fit"
        >
          <ContentCopy />
          {t('copy-referral-link')}
        </button>
      </Tooltip>
      <div className="text-f14">{t('your-referral-code')} {affiliateCode}</div>
    </div>
  );
};
