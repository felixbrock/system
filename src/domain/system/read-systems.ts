import { System } from '../entities';
import IUseCase from '../services/use-case';
import WarningDto from '../warning/warning-dto';
import Result from '../value-types/transient-types';
import {ISystemRepository, SystemQueryDto } from './i-system-repository';
import SystemDto from './system-dto';
import { Warning } from '../value-types';

export interface ReadSystemsRequestDto {
  name?: string;
  warning?: { createdOn?: number };
  modifiedOn?: number;
}

export type ReadSystemsResponseDto = Result<SystemDto[] | null>;

export class ReadSystems
  implements IUseCase<ReadSystemsRequestDto, ReadSystemsResponseDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(request: ReadSystemsRequestDto): Promise<ReadSystemsResponseDto> {
    try {
      const systems: System[] | null =
        await this.#systemRepository.findBy(this.#buildSystemQueryDto(request));
      if (!systems) throw new Error(`Queried systems do not exist`);

      return Result.ok<SystemDto[]>(
        systems.map((system) => this.#buildSystemDto(system))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildSystemDto = (system: System): SystemDto => ({
    id: system.id,
    name: system.name,
    warnings: system.warnings.map(
      (warning): WarningDto => this.#buildWarningDto(warning)
    ),
    modifiedOn: system.modifiedOn,
  });

  #buildWarningDto = (warning: Warning): WarningDto => ({
    createdOn: warning.createdOn,
  });

  #buildSystemQueryDto = (
    request: ReadSystemsRequestDto
  ): SystemQueryDto => ({
    name: request.name,
    warning: request.warning,
    modifiedOn: request.modifiedOn
  });
}
