import { System } from '../entities/system';
import { Warning } from '../value-types/warning';

export interface SystemQueryDto {
  name?: string;
  organizationId?: string;
  warning?: WarningQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

interface WarningQueryDto {
  createdOnStart?: number;
  createdOnEnd?: number;
  selectorId?: string;
}

export interface SystemUpdateDto {
  name?: string;
  organizationId?: string;
  warning?: Warning;
  modifiedOn?: number;
}

export interface ISystemRepository {
  findOne(id: string): Promise<System | null>;
  findBy(systemQueryDto: SystemQueryDto): Promise<System[]>;
  all(): Promise<System[]>;
  updateOne(id: string, updateDto: SystemUpdateDto): Promise<string>;
  insertOne(system: System): Promise<string>;
  deleteOne(systemId: string): Promise<string>;
}
