// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { System, SystemProperties } from '../entities/system';
import { SystemDto, buildSystemDto } from './system-dto';
import { ISystemRepository } from './i-system-repository';

export interface CreateSystemRequestDto {
  name: string;
}

export interface CreateSystemAuthDto {
  organizationId: string;
}

export type CreateSystemResponseDto = Result<SystemDto | null>;

export class CreateSystem
  implements
    IUseCase<
      CreateSystemRequestDto,
      CreateSystemResponseDto,
      CreateSystemAuthDto
    >
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: CreateSystemRequestDto,
    auth: CreateSystemAuthDto
  ): Promise<CreateSystemResponseDto> {
    const system: Result<System | null> = this.#createSystem(
      request,
      auth.organizationId
    );
    if (!system.value) return system;

    try {
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

  #createSystem = (
    request: CreateSystemRequestDto,
    organizationId: string
  ): Result<System | null> => {
    const systemProperties: SystemProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
      organizationId,
    };

    return System.create(systemProperties);
  };
}
