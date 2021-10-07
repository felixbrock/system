import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { AccountDto } from '../../domain/account-api/account-dto';
import { IAccountApiRepository } from '../../domain/account-api/i-account-api-repository';
import { OrganizationDto } from '../../domain/account-api/organization-dto';
import getRoot from '../shared/api-root-builder';

export default class AccountApiRepositoryImpl implements IAccountApiRepository {
  #path = 'api/v1';

  #serviceName = 'account';

  #port = '8081';

  public getOrganization = async (
    organizationId: string,
    jwt: string
  ): Promise<OrganizationDto | null> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` },
      };

      const response = await axios.get(
        `${apiRoot}/organization/${organizationId}`,
        config
      );
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };

  public getBy = async (
    params: URLSearchParams,
    jwt: string
  ): Promise<AccountDto[]> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` },
        params,
      };

      const response = await axios.get(`${apiRoot}/accounts`, config);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error: any) {
      return Promise.reject(new Error(error.response.data.message));
    }
  };
}
