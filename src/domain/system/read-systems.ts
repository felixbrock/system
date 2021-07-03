import { System } from '../entities';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types';
import {ISystemRepository, SystemQueryDto } from './i-system-repository';
import {SystemDto, buildSystemDto } from './system-dto';

export interface ReadSystemsRequestDto {
  name?: string;
  warning?: { createdOn?: number };
  modifiedOn?: number;
}

export type ReadSystemsResponseDto = Result<SystemDto[] | null>;

export class ReadSystems
  implements IUseCase<ReadSystemsRequestDto, ReadSystemsResponseDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(request: ReadSystemsRequestDto): Promise<ReadSystemsResponseDto> {
    try {
      const systems: System[] | null =
        await this.#systemRepository.findBy(this.#buildSystemQueryDto(request));
      if (!systems) throw new Error(`Queried systems do not exist`);

      return Result.ok<SystemDto[]>(
        systems.map((system) => buildSystemDto(system))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildSystemQueryDto = (
    request: ReadSystemsRequestDto
  ): SystemQueryDto => {

    const queryDto : SystemQueryDto = {};

    if(request.name) queryDto.name = request.name;
    if(request.warning && request.warning.createdOn) queryDto.warning = request.warning;
    if(request.modifiedOn) queryDto.modifiedOn = request.modifiedOn;
    
    return queryDto;
  };
}
