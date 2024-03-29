import React from 'react';
import { TableAlignerStyles } from './style';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { toLangKey } from '@Utils/langUtils';
import { useTranslation } from 'react-i18next';

interface ITableAligner {
  keysName: any[];
  values: any[];
  keyStyle?: string;
  valueStyle?: string;
  className?: string;
  getClassName?: (a: string, b: number) => string;
}

export const TableAligner: React.FC<ITableAligner> = ({
  keysName,
  values,
  keyStyle,
  valueStyle,
  className,
  getClassName,
}) => {
  // console.log(`index-keyStyle: `, keyStyle);
  const { t } = useTranslation();
  return (
    <TableAlignerStyles className={className}>
      <Table>
        <TableHead></TableHead>
        <TableBody>
          {keysName.map((row, rowIdx) => {
            // console.log(`getClassName: `, getClassName);
            let classes = '';
            if (getClassName) {
              classes = getClassName(row, rowIdx);
              // console.log(`classes:ns `, classes);
            }
            return (
              <TableRow key={rowIdx} className={classes}>
                {[0, 1].map((col, colIdx) => {
                  return (
                    <TableCell
                      key={`${colIdx}:${rowIdx}`}
                      className={`${col === 0 ? keyStyle : valueStyle
                        } table-cell `}
                    >
                      {col === 0 ? t(toLangKey(keysName[rowIdx])) : values[rowIdx]}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableAlignerStyles>
  );
};
