import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { buildSystemDto, SystemDto } from './system-dto';
import { System } from '../entities/system';
import { ISystemRepository } from './i-system-repository';

export interface ReadSystemRequestDto {
  id: string;
}

export interface ReadSystemAuthDto {
  organizationId: string;
}

export type ReadSystemResponseDto = Result<SystemDto | null>;

export class ReadSystem
  implements
    IUseCase<ReadSystemRequestDto, ReadSystemResponseDto, ReadSystemAuthDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: ReadSystemRequestDto,
    auth: ReadSystemAuthDto
  ): Promise<ReadSystemResponseDto> {
    try {
      const system: System | null = await this.#systemRepository.findOne(
        request.id
      );
      if (!system)
        throw new Error(`System with id ${request.id} does not exist`);

      if (system.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      return Result.ok<SystemDto>(buildSystemDto(system));
    } catch (error: any) {
      return Result.fail<SystemDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
