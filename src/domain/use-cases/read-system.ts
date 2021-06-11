import { IUseCase, Result } from '../shared';


export interface ReadSystemRequestDto {
  id: string;
}

export interface ReadSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
}

export type ReadSystemResponseDto = Result<ReadSystemDto | null>;

export interface IReadSystemRepository {
  findById(system: string): Promise<ReadSystemDto | null>;
}

export class ReadSystem
  implements IUseCase<ReadSystemRequestDto, ReadSystemResponseDto>
{
  #readSystemRepository: IReadSystemRepository;

  public constructor(readSystemRepository: IReadSystemRepository) {
    this.#readSystemRepository = readSystemRepository;
  }

  public async execute(
    request: ReadSystemRequestDto
  ): Promise<ReadSystemResponseDto> {
    try {
      const readSystemResult: ReadSystemDto | null =
        await this.#readSystemRepository.findById(
          request.id
        );
      if (!readSystemResult)
        return Result.fail<null>(
          `System with id ${request.id} does not exist.`
        );

      return Result.ok<ReadSystemDto>(
        readSystemResult
      );
    } catch (error) {
      return Result.fail<ReadSystemDto>(error.message);
    }
  }
}
