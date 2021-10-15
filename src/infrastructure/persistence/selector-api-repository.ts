import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { ISelectorApiRepository } from '../../domain/selector-api/delete-selectors';
import getRoot from '../shared/api-root-builder';

export default class SelectorApiRepositoryImpl
  implements ISelectorApiRepository
{
  #path = 'api/v1';

  #serviceName = 'selector';

  #port = '3000';

  public deleteSelectors = async (
    params: URLSearchParams,
    jwt: string
  ): Promise<string> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` },
        params,
      };

      const response = await axios.delete(`${apiRoot}/selectors`, config);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse.message;
      throw new Error(jsonResponse.message);
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };
}
