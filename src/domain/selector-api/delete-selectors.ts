import { URLSearchParams } from 'url';
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface DeleteSelectorsRequestDto {
  systemId: string;
}

export interface ISelectorApiRepository {
  deleteSelectors(params: URLSearchParams): Promise<Result<null>>;
}

export type DeleteSelectorsResponseDto = Result<null>;

export class DeleteSelectors
  implements IUseCase<DeleteSelectorsRequestDto, DeleteSelectorsResponseDto>
{
  #selectorApiRepository: ISelectorApiRepository;

  public constructor(selectorApiRepository: ISelectorApiRepository) {
    this.#selectorApiRepository = selectorApiRepository;
  }

  public async execute(
    request: DeleteSelectorsRequestDto
  ): Promise<DeleteSelectorsResponseDto> {
    try {
      const selectorResult: Result<null> = await this.#selectorApiRepository.deleteSelectors(
        new URLSearchParams({systemId: request.systemId})
      );
      if (!selectorResult)
        throw new Error(`No selectors for system ${request.systemId} exist`);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  }
}
