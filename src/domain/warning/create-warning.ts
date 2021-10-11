import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { Warning } from '../value-types/warning';
import { buildWarningDto, WarningDto } from './warning-dto';
import { SystemDto } from '../system/system-dto';
import { UpdateSystem } from '../system/update-system';
import { ReadSystem } from '../system/read-system';

export interface CreateWarningRequestDto {
  systemId: string;
  selectorId: string;
}

export interface CreateWarningAuthDto {
  organizationId: string;
}

export type CreateWarningResponseDto = Result<WarningDto | null>;

export class CreateWarning
  implements
    IUseCase<
      CreateWarningRequestDto,
      CreateWarningResponseDto,
      CreateWarningAuthDto
    >
{
  #updateSystem: UpdateSystem;

  #readSystem: ReadSystem;

  public constructor(
    updateSystem: UpdateSystem,
    readSystem: ReadSystem
  ) {
    this.#updateSystem = updateSystem;
    this.#readSystem = readSystem;
  }

  public async execute(
    request: CreateWarningRequestDto,
    auth: CreateWarningAuthDto
  ): Promise<CreateWarningResponseDto> {
    const warning: Result<Warning | null> = Warning.create({
      selectorId: request.selectorId,
    });
    if (!warning.value) return warning;

    try {
      const validatedRequest = await this.validateRequest(
        request.systemId,
        auth.organizationId
      );
      if (validatedRequest.error) throw new Error(validatedRequest.error);

      const warningDto = buildWarningDto(warning.value);

      const updateSystemResult: Result<SystemDto | null> =
        await this.#updateSystem.execute(
          {
            id: request.systemId,
            warning: warningDto,
          },
          { organizationId: auth.organizationId }
        );

      if (updateSystemResult.error) throw new Error(updateSystemResult.error);
      if (!updateSystemResult.value)
        throw new Error(`Couldn't update system ${request.systemId}`);

      return Result.ok<WarningDto>(warningDto);
    } catch (error: any) {
      return Result.fail<WarningDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  private async validateRequest(
    systemId: string,
    organizationId: string
  ): Promise<Result<null>> {
    const readSystemResult = await this.#readSystem.execute(
      { id: systemId },
      { organizationId }
    );

    if (!readSystemResult.value) throw new Error('Selector deletion failed');
    if (!readSystemResult.success) throw new Error(readSystemResult.error);
    if (!readSystemResult.value)
      throw new Error(`System with id ${systemId} does not exist`);

    if (readSystemResult.value.organizationId !== organizationId)
      return Result.fail<null>(`Not authorized to perform action`);

    return Result.ok<null>(null);
  }
}
