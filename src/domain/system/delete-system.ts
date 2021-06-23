import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import { System } from '../entities';
import { DeleteSelectors } from '../selector-api/delete-selectors';
import { ISystemRepository } from './i-system-repository';

export interface DeleteSystemRequestDto {
  id: string;
}

export type DeleteSystemResponseDto = Result<null>;

export class DeleteSystem
  implements IUseCase<DeleteSystemRequestDto, DeleteSystemResponseDto>
{
  #systemRepository: ISystemRepository;

  #deleteSelectors: DeleteSelectors;

  public constructor(
    systemRepository: ISystemRepository,
    deleteSelectors: DeleteSelectors
  ) {
    this.#systemRepository = systemRepository;
    this.#deleteSelectors = deleteSelectors;
  }

  public async execute(
    request: DeleteSystemRequestDto
  ): Promise<DeleteSystemResponseDto> {
    try {
      const system: System | null = await this.#systemRepository.findOne(
        request.id
      );
      if (!system)
        throw new Error(`System with id ${request.id} does not exist`);

      const deleteSelectorsResult: Result<null> =
        await this.#deleteSelectors.execute({ systemId: request.id });

      if (deleteSelectorsResult.error) throw new Error(deleteSelectorsResult.error);

      const deleteSystemResult: Result<null> =
        await this.#systemRepository.delete(request.id);

      if(deleteSystemResult.error) throw new Error(deleteSystemResult.error);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
