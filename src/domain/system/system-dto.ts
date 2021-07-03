import { System } from '../entities';
import { WarningDto } from '../warning/warning-dto';

export interface SystemDto {
  id: string;
  name: string;
  warnings: WarningDto[];
  modifiedOn: number;
};

export const buildSystemDto = (system: System): SystemDto => ({
  id: system.id,
  name: system.name,
  warnings: system.warnings,
  modifiedOn: system.modifiedOn,
});
