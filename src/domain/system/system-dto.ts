import { Warning } from '../value-types';

export default interface SystemDto {
  id: string;
  name: string;
  warnings: Warning[];
  modifiedOn: number;
  // eslint-disable-next-line semi
}
