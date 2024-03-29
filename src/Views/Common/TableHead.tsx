import { toLangKey } from '@Utils/langUtils';
import { TableHeads } from '@Views/Common/TableComponents/TableComponents';
interface ITableHeader {
  col: number;
  headsArr: (string | JSX.Element)[];
  className?: string;
  firstColClassName?: string;
}
import { useTranslation } from 'react-i18next';

export const TableHeader: React.FC<ITableHeader> = ({
  col,
  headsArr,
  className,
  firstColClassName,
}) => {
  const { t } = useTranslation();
  if (col > headsArr.length) return <div>Unhandled col of header</div>;
  return (
    <TableHeads
      style={col === 0 ? firstColClassName + ' ' + className : className}
    >
      {t(toLangKey(headsArr[col] as string))}
    </TableHeads>
  );
};
