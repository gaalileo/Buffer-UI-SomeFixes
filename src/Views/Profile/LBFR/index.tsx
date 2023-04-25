import { Section } from '@Views/Earn/Components/Section';
import {
  keyClasses,
  tooltipKeyClasses,
  tooltipValueClasses,
  valueClasses,
} from '@Views/Earn/Components/VestCards';
import { profileCardClass } from '../Components/ProfileCards';
import { Card } from '@Views/Earn/Components/Card';
import { TableAligner } from '@Views/V2-Leaderboard/Components/TableAligner';
import { wrapperClasses } from '@Views/Earn/Components/EarnCards';
import { Display } from '@Views/Common/Tooltips/Display';
import { getDisplayDate, getDisplayTime } from '@Utils/Dates/displayDateTime';
import { usePoolNames } from '@Views/Dashboard/Hooks/useArbitrumOverview';
import { useMemo, useState } from 'react';
import { BlueBtn } from '@Views/Common/V2-Button';
import { btnClasses } from '@Views/Earn/Components/EarnButtons';
import { ConnectionRequired } from '@Views/Common/Navbar/AccountDropdown';
import { LBFRmodals } from './modals';
import { useSetAtom } from 'jotai';
import { LBFRModalAtom, LBFRModalNumberAtom } from './atom';
import { useUserAccount } from '@Hooks/useUserAccount';
import { stakedType, useLBFRreadCalls } from './Hooks/useReadCalls';
import { LBFRGraphqlType, useLBFRGraphql } from './Hooks/useGraphql';
import {
  divide,
  gt,
  lt,
  lte,
  multiply,
} from '@Utils/NumString/stringArithmatics';
import { useActiveChain } from '@Hooks/useActiveChain';
import { toFixed } from '@Utils/NumString';
import { Skeleton } from '@mui/material';
import { WalletNotConnectedCard } from '../Components/ProfileCards';
import { useWriteCall } from '@Hooks/useWriteCall';
import { getContract } from './Config/Addresses';
import RewardTrackerAbi from '@Views/Earn/Config/Abis/RewardTracker.json';
import { useToast } from '@Contexts/Toast';
import { SomethingWentWrongModal } from '@Views/Common/Modals/SomethingWentWrong';
import axios from 'axios';
import LBFRabi from './Config/FaucetLBFR.json';
import useStopWatch from '@Hooks/Utilities/useStopWatch';
import { useWeekOfTournament } from '@Views/V2-Leaderboard/Hooks/useWeekOfTournament';
import { LBFRconfig } from './config';
import { TimerBox } from '@Views/V2-Leaderboard/Incentivised';
import { getDistance } from '@Utils/Time';

export const LBFR = () => {
  return (
    <>
      <LBFRmodals />
      <Cards />
    </>
  );
};
const Cards = () => {
  const graphData = useLBFRGraphql();
  const readcallData = useLBFRreadCalls();
  const { activeChain } = useActiveChain();
  const launchTimeStamp = LBFRconfig[activeChain.id]?.startTimestamp / 1000;
  const distance = getDistance(launchTimeStamp);
  if (!launchTimeStamp) return <></>;
  if (distance > 0)
    return (
      <></>
      // <TimerBox
      //   expiration={launchTimeStamp}
      //   className="mt-[5vh] m-auto"
      //   head={
      //     <span className="text-5  mb-[25px] text-f16">
      //       Loyalty Program starts in
      //     </span>
      //   }
      // />
    );
  // return (
  //   <Section
  //     Heading={<div className="text-f22">Loyalty Program</div>}
  //     subHeading={<></>}
  //     Cards={[
  //       <TimerBox
  //         expiration={launchTimeStamp}
  //         className="mt-[5vh] m-auto"
  //         head={
  //           <span className="text-5  mb-[25px] text-f16">
  //             Loyalty Program starts in
  //           </span>
  //         }
  //       />,
  //     ]}
  //     className="!mt-7"
  //   />
  // );
  return (
    <Section
      Heading={<div className="text-f22">Loyalty Program</div>}
      subHeading={<></>}
      Cards={[
        <ClaimCard data={graphData} />,
        <StakeCard data={readcallData} />,
      ]}
      className="!mt-7"
    />
  );
};

const Timer = () => {};

const TimeLeft = () => {
  const { activeChain } = useActiveChain();
  const { nextTimeStamp } = useWeekOfTournament({
    startTimestamp: LBFRconfig[activeChain.id]?.startTimestamp,
  });

  const stopwatch = useStopWatch(nextTimeStamp / 1000);
  return <>{stopwatch}</>;
};

const ClaimCard = ({ data }: { data: LBFRGraphqlType }) => {
  const toastify = useToast();
  const [btnState, setBtnState] = useState(false);
  const { viewOnlyMode } = useUserAccount();
  const { address: account } = useUserAccount();
  const { activeChain } = useActiveChain();
  const decimals = 18;
  const unit = 'LBFR';
  const heading = 'Claim LBFR';
  const { poolNames } = usePoolNames();
  const tokens = useMemo(
    () => poolNames.filter((pool) => !pool.toLowerCase().includes('pol')),
    [poolNames]
  );
  const { writeCall } = useWriteCall(
    getContract(activeChain.id, 'LBFRfaucet'),
    LBFRabi
  );

  async function claim() {
    if (
      data &&
      data.totalVolume &&
      data.totalVolume[0] &&
      lte(data.totalVolume[0].claimable, '0')
    )
      return toastify({
        type: 'error',
        msg: `You have no LBFR to claim`,
        id: 'claimLBFR',
      });

    setBtnState(true);
    try {
      const res = await axios.get(
        `https://lbfr.buffer-finance-api.link/lbfr/claim/${import.meta.env.VITE_ENV.toLowerCase()}/${account}`
      );
      console.log(res, 'res');
      if (res.data.error) {
        setBtnState(false);
        return;
      }
      const {
        signed_hash,
        current_week_token_allocation,
        former_week_token_allocation,
        weekID,
      } = res.data;

      writeCall(() => setBtnState(false), 'claim', [
        signed_hash,
        current_week_token_allocation,
        former_week_token_allocation,
        weekID,
      ]);
    } catch (e) {
      toastify({
        type: 'error',
        msg: `Failed to fetch data. Please try again. ${e}`,
        id: 'claimLBFR',
      });
      setBtnState(false);
    }
  }
  const currentSlab = useMemo(() => {
    if (!data || !data.totalVolume?.[0].currentSlab) return '1';
    const slab = data.totalVolume[0].currentSlab;
    console.log(slab, 'slab');
    if (lt(slab, '1')) return '1';
    return divide(slab, 2);
  }, []);

  if (account === undefined)
    return <WalletNotConnectedCard heading={heading} />;
  if (data === undefined)
    return (
      <Skeleton
        key={'claimCardLoader'}
        variant="rectangular"
        className="w-full !h-full min-h-[270px] !transform-none !bg-1"
      />
    );

  return (
    <Card
      className={profileCardClass}
      shouldShowDivider={false}
      top={heading}
      middle={
        <TableAligner
          className="mt-3"
          keyStyle={keyClasses}
          valueStyle={valueClasses}
          keysName={[
            'Claimable',
            'Claimed',
            'Last claimed',
            'Volume',
            'Loyalty points per USDC',
            'Time left for reset',
          ]}
          values={[
            <div className={wrapperClasses}>
              <Display
                data={divide(data.totalVolume?.[0]?.claimable ?? '0', decimals)}
                unit={unit}
              />
            </div>,
            <div className={wrapperClasses}>
              <Display
                data={divide(data.totalVolume?.[0]?.claimed ?? '0', decimals)}
                unit={unit}
              />
            </div>,
            <div className={wrapperClasses}>
              {data.lbfrclaimDataPerUser?.lastClaimedTimestamp
                ? getDisplayDate(
                    Number(data.lbfrclaimDataPerUser.lastClaimedTimestamp)
                  ) +
                  ' ' +
                  getDisplayTime(
                    Number(data.lbfrclaimDataPerUser.lastClaimedTimestamp)
                  )
                : 'Not claimed yet.'}
            </div>,
            <div className={wrapperClasses}>
              <Display
                data={divide(data.totalVolume?.[0]?.volume ?? '0', decimals)}
                unit={'USDC'}
                content={
                  tokens.length > 1 && (
                    <TableAligner
                      keysName={tokens}
                      keyStyle={tooltipKeyClasses}
                      valueStyle={tooltipValueClasses}
                      values={tokens.map((token) => {
                        const stats = data.totalVolume?.[0]?.[`volume${token}`];
                        if (stats)
                          return (
                            toFixed(divide(stats, decimals) as string, 2) +
                            ' ' +
                            token
                          );
                        else return '-';
                      })}
                    />
                  )
                }
              />
            </div>,
            <div className={wrapperClasses}>
              <Display data={currentSlab} unit={unit + '/USDC'} />
            </div>,
            <div className={wrapperClasses}>
              <TimeLeft />
            </div>,
          ]}
        />
      }
      bottom={
        <ConnectionRequired className={'mt-7 mb-5 ' + btnClasses}>
          <div className="flex items-center gap-4 mt-7 mb-5 ">
            <BlueBtn
              onClick={claim}
              className={btnClasses}
              isDisabled={viewOnlyMode}
              isLoading={btnState}
            >
              Claim
            </BlueBtn>
          </div>
        </ConnectionRequired>
      }
    />
  );
};

const StakeCard = ({ data }: { data: null | stakedType }) => {
  const toastify = useToast();
  try {
    const [btnState, setBtnState] = useState(false);
    const { address: account } = useUserAccount();
    const setIsModalOpen = useSetAtom(LBFRModalAtom);
    const setActiveModalNumber = useSetAtom(LBFRModalNumberAtom);
    const { activeChain } = useActiveChain();
    const { writeCall } = useWriteCall(
      getContract(activeChain.id, 'LBFRrewardTracker'),
      RewardTrackerAbi
    );
    const { viewOnlyMode } = useUserAccount();
    const unit = 'LBFR';
    const rewardUnit = 'BFR';
    const rewardDecimals = 18;
    const heading = 'Stake LBFR';

    function stake() {
      setIsModalOpen(true);
      setActiveModalNumber(0);
    }
    function unstake() {
      setIsModalOpen(true);
      setActiveModalNumber(1);
    }
    function claim() {
      setBtnState(true);
      if (
        data &&
        !gt(divide(data.userRewards, rewardDecimals) as string, '0')
      ) {
        toastify({
          type: 'error',
          msg: `No rewards to claim.`,
          id: 'claimLBFR',
        });
        setBtnState(false);
        return;
      }
      writeCall(
        () => {
          setBtnState(false);
        },
        'claim',
        [account]
      );
    }

    if (account === undefined)
      return <WalletNotConnectedCard heading={heading} />;
    if (!data)
      return (
        <Skeleton
          key={'stakeCardLoader'}
          variant="rectangular"
          className="w-full !h-full min-h-[270px] !transform-none !bg-1"
        />
      );
    return (
      <Card
        className={profileCardClass}
        shouldShowDivider={false}
        top={heading}
        middle={
          <TableAligner
            className="mt-3"
            keyStyle={keyClasses}
            valueStyle={valueClasses}
            keysName={[
              'Wallet',
              'Staked',
              //  'APR',
              'Weekly Reward Pool',
              'Total Staked',
              'Rewards',
            ]}
            values={[
              <div className={wrapperClasses}>
                <Display
                  data={divide(data.userBalance, data.decimals)}
                  unit={unit}
                />
              </div>,
              <div className={wrapperClasses}>
                <Display
                  data={divide(data.userStaked, data.decimals)}
                  unit={unit}
                />
              </div>,
              // <div className={wrapperClasses}>
              //   <Display data={'0000'} unit="dummy" />
              // </div>,
              <div className={wrapperClasses}>
                <Display
                  data={divide(
                    multiply(multiply(data.tokensPerInterval, '7'), '86400'),
                    rewardDecimals
                  )}
                  unit={rewardUnit}
                />
              </div>,
              <div className={wrapperClasses}>
                <Display
                  data={divide(data.totalStakedLBFR, data.decimals)}
                  unit={unit}
                />
              </div>,
              <div className={wrapperClasses}>
                <Display
                  data={divide(data.userRewards, rewardDecimals)}
                  unit={rewardUnit}
                />
              </div>,
            ]}
          />
        }
        bottom={
          <ConnectionRequired className={'mt-7 mb-5 ' + btnClasses}>
            <div className="flex items-center gap-4 mt-7 mb-5 flex-wrap">
              <BlueBtn
                onClick={stake}
                className={btnClasses}
                isDisabled={viewOnlyMode}
              >
                Stake
              </BlueBtn>
              <BlueBtn
                onClick={unstake}
                className={btnClasses}
                isDisabled={viewOnlyMode}
              >
                Unstake
              </BlueBtn>
              <BlueBtn
                onClick={claim}
                className={btnClasses}
                isDisabled={viewOnlyMode}
                isLoading={btnState}
              >
                Claim BFR
              </BlueBtn>
            </div>
          </ConnectionRequired>
        }
      />
    );
  } catch (e) {
    toastify({ type: 'error', msg: 'Stake Card ' + (e as Error).message });
    return <SomethingWentWrongModal />;
  }
};