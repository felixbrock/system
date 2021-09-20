import axios from 'axios';
import { URLSearchParams } from 'url';
import { nodeEnv, serviceDiscoveryNamespace } from '../../config';
import { ISelectorApiRepository } from '../../domain/selector-api/delete-selectors';
import Result from '../../domain/value-types/transient-types/result';
import { DiscoveredService, discoverService } from '../shared/service-discovery';


export default class SelectorApiRepositoryImpl implements ISelectorApiRepository {
  #getRoot = async (): Promise<string> => {
    const path = 'api/v1';

    if (nodeEnv !== 'production') return `http://localhost:3000/${path}`;

    try {
      const discoveredService : DiscoveredService = await discoverService(
        serviceDiscoveryNamespace,
        'selector-service'
      );

      return `http://${discoveredService.ip}:${discoveredService.port}/${path}`;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  public deleteSelectors = async (params: URLSearchParams): Promise<Result<null>> => {
    try {
      const apiRoot = await this.#getRoot();

      const response = await axios.delete(`${apiRoot}/selectors`, {params});
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error: any) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);;
    }
  };
}
