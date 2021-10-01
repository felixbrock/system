// TODO Violation of Dependency Rule
import IUseCase from '../services/use-case';
import { System } from '../entities/system';
import { SystemDto, buildSystemDto } from './system-dto';
import Result from '../value-types/transient-types/result';
import { Warning } from '../value-types/warning';
import { WarningDto } from '../warning/warning-dto';
import { ISystemRepository, SystemUpdateDto } from './i-system-repository';
import {
  GetOrganization,
  GetOrganizationDto,
} from '../account-api/get-organization';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated
export interface UpdateSystemRequestDto {
  id: string;
  name?: string;
  organizationId?: string;
  warning?: WarningDto;
}

export type UpdateSystemResponseDto = Result<SystemDto | null>;

export class UpdateSystem
  implements IUseCase<UpdateSystemRequestDto, UpdateSystemResponseDto>
{
  #systemRepository: ISystemRepository;

  #getOrganization: GetOrganization;

  public constructor(
    systemRepository: ISystemRepository,
    getOrganization: GetOrganization
  ) {
    this.#systemRepository = systemRepository;
    this.#getOrganization = getOrganization;
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

      await this.#validateRequest(request);

      const updateDto = await this.#buildUpdateDto(request);

      await this.#systemRepository.updateOne(request.id, updateDto);

      // TODO - Doesn't return the right object. Fix.
      return Result.ok<SystemDto>(buildSystemDto(system));
    } catch (error: any) {
      return Result.fail<SystemDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #validateRequest = async (request: UpdateSystemRequestDto): Promise<undefined> => {
    try {
      if (request.organizationId) {
        const readOrganizationResult: Result<GetOrganizationDto | null> =
          await this.#getOrganization.execute({ id: request.organizationId });

        if (!readOrganizationResult.value)
          throw new Error(
            `System's organization ${request.organizationId} does not exist`
          );
      }
      return undefined;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  #buildUpdateDto = async (
    request: UpdateSystemRequestDto
  ): Promise<SystemUpdateDto> => {
    const updateDto: SystemUpdateDto = {};

    if (request.name) updateDto.name = request.name;
    if (request.organizationId)
      updateDto.organizationId = request.organizationId;

    if (request.warning) {
      const createResult = Warning.create({
        selectorId: request.warning.selectorId,
      });
      // TODO No uniform usage of Result.value Result.error and result.success. Fix.
      if (createResult.error) throw new Error(createResult.error);
      if (!createResult.value)
        throw new Error(
          `Creation of selector warning ${request.warning} failed`
        );

      updateDto.warning = createResult.value;
    }

    updateDto.modifiedOn = Date.now();

    return updateDto;
  };
}
