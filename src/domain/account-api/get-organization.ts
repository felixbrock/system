// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import { IAccountApiRepository } from './i-account-api-repository';
import { OrganizationDto } from './organization-dto';

export interface GetOrganizationRequestDto {
  id: string;
}

export interface GetOrganizationAuthDto {
  jwt: string
}

export type GetOrganizationResponseDto = Result<OrganizationDto | null>;



export class GetOrganization
  implements IUseCase<GetOrganizationRequestDto, GetOrganizationResponseDto, GetOrganizationAuthDto>
{
  #accountApiRepository: IAccountApiRepository;

  public constructor(accountApiRepository: IAccountApiRepository) {
    this.#accountApiRepository = accountApiRepository;
  }

  public async execute(
    request: GetOrganizationRequestDto,
    auth: GetOrganizationAuthDto
  ): Promise<GetOrganizationResponseDto> {
    try {
      const getOrganizationResponse: OrganizationDto | null =
        await this.#accountApiRepository.getOrganization(request.id, auth.jwt);

      if (!getOrganizationResponse)
        throw new Error(`No organization found for id ${request.id}`);

      return Result.ok<OrganizationDto>(getOrganizationResponse);
    } catch (error: any) {
      return Result.fail<OrganizationDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
