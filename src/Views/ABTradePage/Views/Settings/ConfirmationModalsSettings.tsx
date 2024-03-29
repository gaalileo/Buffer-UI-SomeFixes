import { ResetButton } from '@Views/ABTradePage/Components/ResetButton';
import { RowBetween, RowGapItemsTop } from '@Views/ABTradePage/Components/Row';
import { Switch } from '@Views/ABTradePage/Components/Switch';
import {
  SettingsHeaderText,
  SettingsText,
} from '@Views/ABTradePage/Components/TextWrapper';
import { chartControlsSettingsAtom } from '@Views/ABTradePage/atoms';
import { defaultSettings } from '@Views/ABTradePage/config';
import { Trans } from '@lingui/macro';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const ConfirmationModalsSettings: React.FC = () => {
  const [settings, setSettings] = useAtom(chartControlsSettingsAtom);
  const { t } = useTranslation();
  function resetToDefault() {
    setSettings(defaultSettings.chartControls);
  }

  function toggleCloseConfirmation(event: React.ChangeEvent<HTMLInputElement>) {
    setSettings((prev) => ({
      ...prev,
      earlyCloseConfirmation: !prev.earlyCloseConfirmation,
    }));
  }
  function toggleLODragging(event: React.ChangeEvent<HTMLInputElement>) {
    setSettings((prev) => ({
      ...prev,
      loDragging: !prev.loDragging,
    }));
  }

  return (
    <div className="sm:hidden">
      <RowGapItemsTop gap="4px">
        <SettingsHeaderText>
          <Trans>{t('chart-controls')}</Trans>
        </SettingsHeaderText>
        <ResetButton onClick={resetToDefault} className="mt-1" />
      </RowGapItemsTop>

      <RowBetween className="">
        <SettingsText>{t('show-early-close-confirmations')}</SettingsText>
        <Switch
          isOn={settings.earlyCloseConfirmation}
          onChange={toggleCloseConfirmation}
        />
      </RowBetween>
      <RowBetween className="mt-4">
        <SettingsText>{t('show-drag-n-edit-limit-orders-confirmations')}</SettingsText>
        <Switch isOn={settings.loDragging} onChange={toggleLODragging} />
      </RowBetween>
    </div>
  );
};
