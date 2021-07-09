import { System } from "../entities/system";
import Result from "../value-types/transient-types/result";

export interface SystemQueryDto {
  name?: string;
  warning?: WarningQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface WarningQueryDto {
  createdOnStart?: number;
  createdOnEnd?: number;
}

export interface ISystemRepository {
  findOne(id: string): Promise<System | null>;
  findBy(
    subscriptionQueryDto: SystemQueryDto
  ): Promise<System[]>;
  all(): Promise<System[]>;
  update(system: System): Promise<Result<null>>;
  save(system: System): Promise<Result<null>>;
  delete(systemId: string): Promise<Result<null>>;
  // eslint-disable-next-line semi
}