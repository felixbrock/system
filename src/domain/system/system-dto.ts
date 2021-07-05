import { System } from '../entities/system';
import { buildWarningDto, WarningDto } from '../warning/warning-dto';

export interface SystemDto {
  id: string;
  name: string;
  warnings: WarningDto[];
  modifiedOn: number;
}

export const buildSystemDto = (system: System): SystemDto => ({
  id: system.id,
  name: system.name,
  warnings: system.warnings.map(
    (warning): WarningDto => buildWarningDto(warning)
  ),
  modifiedOn: system.modifiedOn,
});
