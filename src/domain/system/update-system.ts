// TODO Violation of Dependency Rule
import IUseCase from '../services/use-case';
import { System } from '../entities';
import SystemDto from './system-dto';
import ISystemRepository from './i-system-repository';
import Result from '../value-types/transient-types';
import { Warning } from '../value-types';
import WarningDto from '../warning/warning-dto';

export interface UpdateSystemRequestDto {
  id: string;
  name?: string;
  warning?: WarningDto;
}

export type UpdateSystemResponseDto = Result<SystemDto | null>;

export class UpdateSystem
  implements IUseCase<UpdateSystemRequestDto, UpdateSystemResponseDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: UpdateSystemRequestDto
  ): Promise<UpdateSystemResponseDto> {
    try {
      const system: System | null = await this.#systemRepository.findById(
        request.id
      );

      if (!system)
        return Result.fail<SystemDto>(
          `System with id ${request.id} does not exist`
        );

      this.#modifySystem(system, request);

      await this.#systemRepository.update(system);

      return Result.ok<SystemDto>(this.#buildSystemDto(system));
    } catch (error) {
      return Result.fail<SystemDto>(error.message);
    }
  }

  #buildSystemDto = (system: System): SystemDto => ({
    id: system.id,
    name: system.name,
    warnings: system.warnings,
    modifiedOn: system.modifiedOn,
  });

  #modifySystem = (system: System, request: UpdateSystemRequestDto): System => {
    const systemToModify = system;

    systemToModify.name = request.name || system.name;

    if (request.warning) {
      const warningResult = Warning.create();
      // TODO No uniform usage of Result.value Result.error and result.success. Fix.
      if (warningResult.error) throw new Error(warningResult.error);
      if (!warningResult.value) throw new Error(`Creation of system warning ${request.warning} failed`);

      systemToModify.addWarning(warningResult.value);
    }

    systemToModify.modifiedOn = Date.now();

    return systemToModify;
  };
}
