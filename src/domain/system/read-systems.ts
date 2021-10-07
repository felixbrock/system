import { System } from '../entities/system';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { ISystemRepository, SystemQueryDto } from './i-system-repository';
import { SystemDto, buildSystemDto } from './system-dto';

export interface ReadSystemsRequestDto {
  name?: string;
  warning?: {
    createdOnStart?: number;
    createdOnEnd?: number;
    selectorId?: string;
  };
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface ReadSystemsAuthDto {
  organizationId: string;
}

export type ReadSystemsResponseDto = Result<SystemDto[] | null>;

export class ReadSystems
  implements
    IUseCase<ReadSystemsRequestDto, ReadSystemsResponseDto, ReadSystemsAuthDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: ReadSystemsRequestDto,
    auth: ReadSystemsAuthDto
  ): Promise<ReadSystemsResponseDto> {
    try {
      const systems: System[] | null = await this.#systemRepository.findBy(
        this.#buildSystemQueryDto(request, auth.organizationId)
      );
      if (!systems)
        throw new Error(`Queried systems do not exist`);

      return Result.ok<SystemDto[]>(
        systems.map((system) => buildSystemDto(system))
      );
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #buildSystemQueryDto = (
    request: ReadSystemsRequestDto,
    organizationId: string
  ): SystemQueryDto => {
    const queryDto: SystemQueryDto = {};

    if (!organizationId) throw new Error('Not authorized to perform action');

    queryDto.organizationId = organizationId;

    if (request.name) queryDto.name = request.name;

    if (
      request.warning &&
      (request.warning.createdOnStart ||
        request.warning.createdOnEnd ||
        request.warning.selectorId)
    )
      queryDto.warning = request.warning;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
