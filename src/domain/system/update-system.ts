// TODO Violation of Dependency Rule
import IUseCase from '../services/use-case';
import { SystemDto } from './system-dto';
import Result from '../value-types/transient-types/result';
import { Warning } from '../value-types/warning';
import { WarningDto } from '../warning/warning-dto';
import { ISystemRepository, SystemUpdateDto } from './i-system-repository';
import { ReadSystem } from './read-system';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated
export interface UpdateSystemRequestDto {
  id: string;
  name?: string;
  warning?: WarningDto;
}

export interface UpdateSystemAuthDto {
  organizationId: string;
}

export type UpdateSystemResponseDto = Result<string>;

export class UpdateSystem
  implements
    IUseCase<
      UpdateSystemRequestDto,
      UpdateSystemResponseDto,
      UpdateSystemAuthDto
    >
{
  #systemRepository: ISystemRepository;

  #readSystem: ReadSystem;

  public constructor(
    systemRepository: ISystemRepository,
    readSystem: ReadSystem
  ) {
    this.#systemRepository = systemRepository;
    this.#readSystem = readSystem;
  }

  public async execute(
    request: UpdateSystemRequestDto,
    auth: UpdateSystemAuthDto
  ): Promise<UpdateSystemResponseDto> {
    try {
      const readSystemResult = await this.#readSystem.execute(
        { id: request.id },
        { organizationId: auth.organizationId }
      );

      if (!readSystemResult.success) throw new Error(readSystemResult.error);

      if (!readSystemResult.value)
        throw new Error(`System with id ${request.id} does not exist`);

      if (readSystemResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const updateDto = await this.#buildUpdateDto(request);

      const updateResult = await this.#systemRepository.updateOne(
        request.id,
        updateDto
      );

      return Result.ok(updateResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildUpdateDto = async (
    request: UpdateSystemRequestDto
  ): Promise<SystemUpdateDto> => {
    const updateDto: SystemUpdateDto = {};

    if (request.name) updateDto.name = request.name;

    if (request.warning)
      updateDto.warning = Warning.create({
        selectorId: request.warning.selectorId,
      });

    updateDto.modifiedOn = Date.now();

    return updateDto;
  };
}
