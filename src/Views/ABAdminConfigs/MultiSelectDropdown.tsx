import { ReactMenu } from '@Views/Common/ReactMenu';
import { useTranslation } from "react-i18next";

export const MultiSelectDropdown = ({
  options,
}: {
  options: JSX.Element[];
}) => {
  const { t } = useTranslation();
  console.log(options, 'options');
  return (
    <ReactMenu
      MenuHeader={<div>{t('select-assets')}</div>}
      MenuOptions={<>{options}</>}
    />
  );
};
