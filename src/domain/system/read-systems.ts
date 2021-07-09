import { System } from '../entities/system';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { ISystemRepository, SystemQueryDto } from './i-system-repository';
import { SystemDto, buildSystemDto } from './system-dto';

export interface ReadSystemsRequestDto {
  name?: string;
  warning?: { createdOnStart?: number; createdOnEnd?: number };
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export type ReadSystemsResponseDto = Result<SystemDto[] | null>;

export class ReadSystems
  implements IUseCase<ReadSystemsRequestDto, ReadSystemsResponseDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: ReadSystemsRequestDto
  ): Promise<ReadSystemsResponseDto> {
    try {
      const systems: System[] | null = await this.#systemRepository.findBy(
        this.#buildSystemQueryDto(request)
      );
      if (!systems) throw new Error(`Queried systems do not exist`);

      return Result.ok<SystemDto[]>(
        systems.map((system) => buildSystemDto(system))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildSystemQueryDto = (request: ReadSystemsRequestDto): SystemQueryDto => {
    const queryDto: SystemQueryDto = {};

    if (request.name) queryDto.name = request.name;
    if (
      request.warning &&
      (request.warning.createdOnStart || request.warning.createdOnEnd)
    )
      queryDto.warning = request.warning;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
