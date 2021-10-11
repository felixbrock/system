import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { DeleteSelectors } from '../selector-api/delete-selectors';
import { ISystemRepository } from './i-system-repository';
import { ReadSystem } from './read-system';

export interface DeleteSystemRequestDto {
  id: string;
}

export interface DeleteSystemAuthDto {
  jwt: string;
  organizationId: string;
}

export type DeleteSystemResponseDto = Result<null>;

export class DeleteSystem
  implements
    IUseCase<
      DeleteSystemRequestDto,
      DeleteSystemResponseDto,
      DeleteSystemAuthDto
    >
{
  #systemRepository: ISystemRepository;

  #deleteSelectors: DeleteSelectors;

  #readSystem: ReadSystem;

  public constructor(
    systemRepository: ISystemRepository,
    deleteSelectors: DeleteSelectors,
    readSystem: ReadSystem
  ) {
    this.#systemRepository = systemRepository;
    this.#deleteSelectors = deleteSelectors;
    this.#readSystem = readSystem;
  }

  public async execute(
    request: DeleteSystemRequestDto,
    auth: DeleteSystemAuthDto
  ): Promise<DeleteSystemResponseDto> {
    try {
      const readSystemResult = await this.#readSystem.execute(
        { id: request.id },
        { organizationId: auth.organizationId }
      );
      
      if (!readSystemResult.success) throw new Error(readSystemResult.error);
      if (!readSystemResult.value)
        throw new Error(`System with id ${request.id} does not exist`);

      if (readSystemResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const deleteSelectorsResult: Result<null> =
        await this.#deleteSelectors.execute(
          { systemId: request.id },
          { jwt: auth.jwt }
        );

      if (deleteSelectorsResult.error)
        throw new Error(deleteSelectorsResult.error);

      const deleteSystemResult: Result<null> =
        await this.#systemRepository.deleteOne(request.id);

      if (deleteSystemResult.error) throw new Error(deleteSystemResult.error);

      return Result.ok<null>();
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
