// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { System, SystemProperties } from '../entities/system';
import { SystemDto, buildSystemDto } from './system-dto';
import { ISystemRepository } from './i-system-repository';
import { ReadSystems, ReadSystemsResponseDto } from './read-systems';

export interface CreateSystemRequestDto {
  name: string;
}

export interface CreateSystemAuthDto {
  organizationId: string;
}

export type CreateSystemResponseDto = Result<SystemDto>;

export class CreateSystem
  implements
    IUseCase<
      CreateSystemRequestDto,
      CreateSystemResponseDto,
      CreateSystemAuthDto
    >
{
  #systemRepository: ISystemRepository;

  #readSystems: ReadSystems;

  public constructor(
    systemRepository: ISystemRepository,
    readSystems: ReadSystems
  ) {
    this.#systemRepository = systemRepository;
    this.#readSystems = readSystems;
  }

  public async execute(
    request: CreateSystemRequestDto,
    auth: CreateSystemAuthDto
  ): Promise<CreateSystemResponseDto> {
    const system: Result<System> = this.#createSystem(
      request,
      auth.organizationId
    );
    if (!system.value) return system;

    try {
      const readSystemsResult: ReadSystemsResponseDto =
        await this.#readSystems.execute(
          {
            name: system.value.name,
          },
          { organizationId: auth.organizationId }
        );

      if (!readSystemsResult.success) throw new Error(readSystemsResult.error);
      if (!readSystemsResult.value) throw new Error('Reading systems failed');
      if (readSystemsResult.value.length)
        throw new Error(
          `System ${readSystemsResult.value[0].name} is already registered under ${readSystemsResult.value[0].id}`
        );

      await this.#systemRepository.insertOne(system.value);

      return Result.ok(buildSystemDto(system.value));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #createSystem = (
    request: CreateSystemRequestDto,
    organizationId: string
  ): Result<System> => {
    const systemProperties: SystemProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
      organizationId,
    };

    return System.create(systemProperties);
  };
}
