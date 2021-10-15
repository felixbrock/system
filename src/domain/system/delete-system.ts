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

export type DeleteSystemResponseDto = Result<string>;

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

      const deleteSelectorsResult: Result<string> =
        await this.#deleteSelectors.execute(
          { systemId: request.id },
          { jwt: auth.jwt }
        );

      if (!deleteSelectorsResult.success)
        throw new Error(deleteSelectorsResult.error);

      const deleteSystemResult: string = await this.#systemRepository.deleteOne(
        request.id
      );

      return Result.ok(deleteSystemResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
