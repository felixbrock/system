import axios, { AxiosRequestConfig } from 'axios';
import { URLSearchParams } from 'url';
import { ISelectorApiRepository } from '../../domain/selector-api/delete-selectors';
import Result from '../../domain/value-types/transient-types/result';
import getRoot from '../shared/api-root-builder';

export default class SelectorApiRepositoryImpl implements ISelectorApiRepository {
  #path = 'api/v1';

  #serviceName = 'selector';

  #port = '3000';
  
  public deleteSelectors = async (params: URLSearchParams, jwt: string): Promise<Result<null>> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` },
        params,
      };

      const response = await axios.delete(`${apiRoot}/selectors`, config);
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error: any) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);;
    }
  };
}
