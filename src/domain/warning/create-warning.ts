import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import { Warning } from '../value-types';
import WarningDto from './warning-dto';
import SystemDto from '../system/system-dto';
import ISystemRepository from '../system/i-system-repository';
import { UpdateSystem } from '../system/update-system';

export interface CreateWarningRequestDto {
  systemId: string;
}

export type CreateWarningResponseDto = Result<WarningDto | null>;

export class CreateWarning
  implements IUseCase<CreateWarningRequestDto, CreateWarningResponseDto>
{
  #systemRepository: ISystemRepository;

  #updateSystem: UpdateSystem;

  public constructor(
    systemRepository: ISystemRepository,
    updateSystem: UpdateSystem
  ) {
    this.#systemRepository = systemRepository;
    this.#updateSystem = updateSystem;
  }

  public async execute(
    request: CreateWarningRequestDto
  ): Promise<CreateWarningResponseDto> {
    const warning: Result<Warning | null> = this.#createWarning();
    if (!warning.value) return warning;

    try {
      const validatedRequest = await this.validateRequest(request.systemId);
      if (validatedRequest.error)
        throw new Error(validatedRequest.error);

      const warningDto = this.#buildWarningDto(warning.value);

      const updateSystemResult: Result<SystemDto | null> =
        await this.#updateSystem.execute({
          id: request.systemId,
          warning: warningDto,
        });

      if (updateSystemResult.error)
        throw new Error(updateSystemResult.error);
      if (!updateSystemResult.value)
        throw new Error(
          `Couldn't update system ${request.systemId}`
        );

      return Result.ok<WarningDto>(warningDto);
    } catch (error) {
      return Result.fail<WarningDto>(error.message);
    }
  }

  private async validateRequest(systemId: string): Promise<Result<null>> {
    const system: SystemDto | null = await this.#systemRepository.findById(
      systemId
    );
    if (!system)
      return Result.fail<null>(`System with id ${systemId} does not exist`);

    return Result.ok<null>(null);
  }

  #buildWarningDto = (warning: Warning): WarningDto => ({
    createdOn: warning.createdOn,
  });

  #createWarning = (): Result<Warning | null> => Warning.create();
}
