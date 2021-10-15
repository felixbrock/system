import { URLSearchParams } from 'url';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface DeleteSelectorsRequestDto {
  systemId: string;
}

export interface DeleteSelectorAuthDto {
  jwt: string;
}

export interface ISelectorApiRepository {
  deleteSelectors(params: URLSearchParams, jwt: string): Promise<string>;
}

export type DeleteSelectorsResponseDto = Result<string>;

export class DeleteSelectors
  implements
    IUseCase<
      DeleteSelectorsRequestDto,
      DeleteSelectorsResponseDto,
      DeleteSelectorAuthDto
    >
{
  #selectorApiRepository: ISelectorApiRepository;

  public constructor(selectorApiRepository: ISelectorApiRepository) {
    this.#selectorApiRepository = selectorApiRepository;
  }

  public async execute(
    request: DeleteSelectorsRequestDto,
    auth: DeleteSelectorAuthDto
  ): Promise<DeleteSelectorsResponseDto> {
    try {
      const selectorResult: string =
        await this.#selectorApiRepository.deleteSelectors(
          new URLSearchParams({ systemId: request.systemId }),
          auth.jwt
        );
      if (!selectorResult)
        throw new Error(`No selectors for system ${request.systemId} exist`);

      return Result.ok(selectorResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
