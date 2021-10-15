import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { buildSystemDto, SystemDto } from './system-dto';
import { ISystemRepository } from './i-system-repository';

export interface ReadSystemRequestDto {
  id: string;
}

export interface ReadSystemAuthDto {
  organizationId: string;
}

export type ReadSystemResponseDto = Result<SystemDto>;

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
      const system = await this.#systemRepository.findOne(request.id);
      if (!system)
        throw new Error(`System with id ${request.id} does not exist`);

      if (system.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      return Result.ok(buildSystemDto(system));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
