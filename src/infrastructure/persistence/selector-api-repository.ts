import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { ISelectorApiRepository } from '../../domain/selector-api/delete-selectors';
import Result from '../../domain/value-types/transient-types/result';

const apiRoot = 'http://localhost:3000/api/v1';

export default class SelectorApiRepositoryImpl implements ISelectorApiRepository {
  public deleteSelectors = async (systemId: string): Promise<Result<null>> => {
    try {
      const params = new URLSearchParams();
      params.append('systemId', systemId);

      await fetch(`${apiRoot}/selectors`, {
        method: 'DELETE',
        body: params,
      });
      // if (response.ok) {
      //   const jsonResponse = await response.json();
      //   return jsonResponse;
      // }
      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  };
}
