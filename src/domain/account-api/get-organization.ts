// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface GetOrganizationRequestDto {
  id: string;
}

export interface GetOrganizationDto {
  id: string;
  name: string;
  modifiedOn: number;
}

export type GetOrganizationResponseDto = Result<GetOrganizationDto | null>;

export interface IAccountApiRepository {
  getOrganization(organizationId: string): Promise<GetOrganizationDto | null>;
}

export class GetOrganization
  implements IUseCase<GetOrganizationRequestDto, GetOrganizationResponseDto>
{
  #accountApiRepository: IAccountApiRepository;

  public constructor(accountApiRepository: IAccountApiRepository) {
    this.#accountApiRepository = accountApiRepository;
  }

  public async execute(
    request: GetOrganizationRequestDto
  ): Promise<GetOrganizationResponseDto> {
    try {
      const getOrganizationResponse: GetOrganizationDto | null =
        await this.#accountApiRepository.getOrganization(request.id);

      if (!getOrganizationResponse)
        throw new Error(`No organization found for id ${request.id}`);

      return Result.ok<GetOrganizationDto>(getOrganizationResponse);
    } catch (error: any) {
      return Result.fail<GetOrganizationDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
