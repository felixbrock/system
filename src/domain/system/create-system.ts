// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { System, SystemProperties } from '../entities/system';
import { SystemDto, buildSystemDto } from './system-dto';
import { ISystemRepository } from './i-system-repository';
import { GetOrganization, GetOrganizationDto } from '../account-api/get-organization';

export interface CreateSystemRequestDto {
  name: string;
  organizationId: string;
}

export type CreateSystemResponseDto = Result<SystemDto | null>;

export class CreateSystem
  implements IUseCase<CreateSystemRequestDto, CreateSystemResponseDto>
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
    request: CreateSystemRequestDto
  ): Promise<CreateSystemResponseDto> {
    const system: Result<System | null> = this.#createSystem(request);
    if (!system.value) return system;

    try {
      await this.#validateRequest(request);

      const readSystemResult: SystemDto[] = await this.#systemRepository.findBy(
        { name: system.value.name }
      );
      if (readSystemResult.length)
        throw new Error(
          `System ${readSystemResult[0].name} is already registered under ${readSystemResult[0].id}`
        );

      await this.#systemRepository.insertOne(system.value);

      return Result.ok<SystemDto>(buildSystemDto(system.value));
    } catch (error: any) {
      return Result.fail<SystemDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #validateRequest = async (
    request: CreateSystemRequestDto
  ): Promise<undefined> => {
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

  #createSystem = (request: CreateSystemRequestDto): Result<System | null> => {
    const systemProperties: SystemProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
      organizationId: request.organizationId,
    };

    return System.create(systemProperties);
  };
}
