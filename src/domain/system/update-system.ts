// TODO Violation of Dependency Rule
import IUseCase from '../services/use-case';
import { System } from '../entities/system';
import { SystemDto, buildSystemDto } from './system-dto';
import Result from '../value-types/transient-types/result';
import {Warning} from '../value-types/warning';
import { WarningDto } from '../warning/warning-dto';
import { ISystemRepository, SystemUpdateDto } from './i-system-repository';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated
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
      const system: System | null = await this.#systemRepository.findOne(
        request.id
      );

      if (!system)
        throw new Error(`System with id ${request.id} does not exist`);

      const updateDto = await this.#buildUpdateDto(request);

      await this.#systemRepository.updateOne(request.id, updateDto);

      // TODO - Doesn't return the right object. Fix.
      return Result.ok<SystemDto>(buildSystemDto(system));
    } catch (error) {
      return Result.fail<SystemDto>(error.message);
    }
  }

  #buildUpdateDto = async (
    request: UpdateSystemRequestDto
  ): Promise<SystemUpdateDto> => {
    const updateDto: SystemUpdateDto = {};

    if (request.name) updateDto.name = request.name;

    if (request.warning) {
      const createResult = Warning.create({selectorId: request.warning.selectorId});
      // TODO No uniform usage of Result.value Result.error and result.success. Fix.
      if (createResult.error) throw new Error(createResult.error);
      if (!createResult.value)
        throw new Error(`Creation of selector warning ${request.warning} failed`);

      updateDto.warning = createResult.value;
    }

    updateDto.modifiedOn = Date.now();

    return updateDto;
  };
}
