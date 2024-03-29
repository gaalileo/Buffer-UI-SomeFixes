import { useTranslation } from 'react-i18next';
import Background from './style';
import { toLangKey } from '@Utils/langUtils';

export interface ITab {
  name: string;
  icon?: JSX.Element;
}

interface IBufferTab {
  value: number;
  handleChange: (event: any, arg: number) => void;
  tablist: ITab[];
  className?: string;
}

const BufferTab: React.FC<IBufferTab> = ({
  value,
  handleChange,
  tablist,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <Background className={className + ' text-f15'}>
      <div className="tabs-root flex cursor-pointer">
        {tablist.map((singleTab: ITab, idx) => {
          return (
            <div className="flex items-center root-button">
              <div
                key={singleTab.name}
                onClick={(e) => {
                  handleChange(e, idx);
                }}
                className={`${value == idx && 'selected-button'}`}
              >
                {/* {singleTab.name} */}
                {t(toLangKey(singleTab.name))}
              </div>
              {singleTab.icon && singleTab.icon}
            </div>
          );
        })}
      </div>
    </Background>
  );
};

export default BufferTab;
