import axios from 'axios';
import {
  IAccountApiRepository,
  GetOrganizationDto,
} from '../../domain/account-api/get-organization';
import getRoot from '../shared/api-root-builder';

export default class AccountApiRepositoryImpl implements IAccountApiRepository {
  #path = 'api/v1';

  #serviceName = 'account';

  #port = '8081';

  public getOrganization = async (organizationId: string): Promise<GetOrganizationDto | null> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const response = await axios.get(`${apiRoot}/organization/${organizationId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
