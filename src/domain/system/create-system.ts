// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import { Id } from '../value-types';
import { System, SystemProperties } from '../entities';
import { SystemDto, buildSystemDto } from './system-dto';
import { ISystemRepository } from './i-system-repository';

export interface CreateSystemRequestDto {
  name: string;
}

export type CreateSystemResponseDto = Result<SystemDto | null>;

export class CreateSystem
  implements IUseCase<CreateSystemRequestDto, CreateSystemResponseDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: CreateSystemRequestDto
  ): Promise<CreateSystemResponseDto> {
    const system: Result<System | null> = this.#createSystem(request);
    if (!system.value) return system;

    try {
      const readSystemResult: SystemDto[] = await this.#systemRepository.findBy(
        { name: system.value.name }
      );
      if (readSystemResult.length)
        throw new Error(
          `System ${readSystemResult[0].name} is already registered under ${readSystemResult[0].id}`
        );

      await this.#systemRepository.save(system.value);

      return Result.ok<SystemDto>(buildSystemDto(system.value));
    } catch (error) {
      return Result.fail<SystemDto>(error.message);
    }
  }

  #createSystem = (request: CreateSystemRequestDto): Result<System | null> => {
    const systemProperties: SystemProperties = {
      id: Id.next(uuidv4).id,
      name: request.name,
    };

    return System.create(systemProperties);
  };
}
