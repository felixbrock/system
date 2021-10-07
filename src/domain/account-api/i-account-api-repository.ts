import { URLSearchParams } from "url";
import { AccountDto } from "./account-dto";
import { OrganizationDto } from "./organization-dto";

export interface IAccountApiRepository {
  getOrganization(organizationId: string, jwt: string): Promise<OrganizationDto | null>;
  getBy(params: URLSearchParams, jwt: string): Promise<AccountDto[]>;
}