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

export type CreateWarningResponseDto = Result<WarningDto>;

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

  public constructor(updateSystem: UpdateSystem, readSystem: ReadSystem) {
    this.#updateSystem = updateSystem;
    this.#readSystem = readSystem;
  }

  public async execute(
    request: CreateWarningRequestDto,
    auth: CreateWarningAuthDto
  ): Promise<CreateWarningResponseDto> {
    const warning: Result<Warning> = Warning.create({
      selectorId: request.selectorId,
    });
    if (!warning.value) return warning;

    try {
      await this.requestIsValid(request.systemId, auth.organizationId);

      const warningDto = buildWarningDto(warning.value);

      const updateSystemResult: Result<SystemDto> =
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

      return Result.ok(warningDto);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  private async requestIsValid(
    systemId: string,
    organizationId: string
  ): Promise<boolean> {
    const readSystemResult = await this.#readSystem.execute(
      { id: systemId },
      { organizationId }
    );

    if (!readSystemResult.success) throw new Error(readSystemResult.error);
    if (!readSystemResult.value)
      return Promise.reject(
        new Error(`System with id ${systemId} does not exist`)
      );

    if (readSystemResult.value.organizationId !== organizationId)
      return Promise.reject(new Error(`Not authorized to perform action`));

    return true;
  }
}
