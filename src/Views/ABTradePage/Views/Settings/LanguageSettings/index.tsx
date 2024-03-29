import { RowGap } from '@Views/ABTradePage/Components/Row';
import { ResetButton } from '@Views/TradePage/Components/ResetButton';
import { RowGapItemsTop } from '@Views/TradePage/Components/Row';
import { SettingsHeaderText } from '@Views/TradePage/Components/TextWrapper';
import React, { useEffect, useState } from 'react';
import { ColumnGap } from '@Views/TradePage/Components/Column';
import { useTranslation } from 'react-i18next';


export default function LanguageSettings() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // handling the direction of the text
    document.body.dir = i18n.dir();
  }, [i18n.language]);

  return (
    <>
      <RowGapItemsTop gap="4px">
        <SettingsHeaderText>
          Langauge Settings
        </SettingsHeaderText>
        <ResetButton onClick={() => {
          i18n.changeLanguage('en');
        }} className="mt-1" />
      </RowGapItemsTop>
      <ColumnGap className='mt-[-1.5rem]'>
        <Langauge
          currentLangauge={i18n.language}
          setLangauge={i18n.changeLanguage}
        />
      </ColumnGap>
    </>
  );
}

export const Langauge: React.FC<{
  setLangauge: (newSlippage: string) => void;
  currentLangauge: string;
}> = ({ setLangauge, currentLangauge }) => {
  return (
    <div>
      <RowGap gap="8px" className="">
        <LangaugeSelector
          currentLangauge={currentLangauge}
          onClick={setLangauge}
        />
      </RowGap>
    </div>
  );
};

type Langauge = {
  code: string;
  name: string;
};

const LANGS = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: "hi", name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export const LangaugeSelector: React.FC<{
  currentLangauge: string;
  onClick: (newSlippage: string) => void;
}> = ({ currentLangauge, onClick }) => {
  return (
    <div className="flex flex-row gap-3 text-f10 text-3 items-center overflow-auto pb-2">
      {LANGS.map((s) => (
        <div
          key={s.code}
          className={
            (currentLangauge == s.code
              ? 'border-[#a3e3ff] text-1 font-semibold'
              : ' border-[#2A2A3A] text-[#c3c2d4]') +
            ' border bg-[#1C1C28] rounded-[5px] hover:border-[#a3e3ff] cursor-pointer px-5 py-3'
          }
          role="button"
          onClick={() => onClick(s.code)}
        >
          {s.nativeName}
        </div>
      ))}
    </div>
  );
};