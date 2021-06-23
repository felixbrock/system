import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import SystemDto from './system-dto';
import { System } from '../entities';
import { ISystemRepository } from './i-system-repository';

export interface ReadSystemRequestDto {
  id: string;
}

export type ReadSystemResponseDto = Result<SystemDto | null>;

export class ReadSystem
  implements IUseCase<ReadSystemRequestDto, ReadSystemResponseDto>
{
  #systemRepository: ISystemRepository;

  public constructor(systemRepository: ISystemRepository) {
    this.#systemRepository = systemRepository;
  }

  public async execute(
    request: ReadSystemRequestDto
  ): Promise<ReadSystemResponseDto> {
    try {
      const system: System | null =
        await this.#systemRepository.findOne(request.id);
      if (!system)
        throw new Error(
          `System with id ${request.id} does not exist`
        );

      return Result.ok<SystemDto>(system);
    } catch (error) {
      return Result.fail<SystemDto>(error.message);
    }
  }
}
