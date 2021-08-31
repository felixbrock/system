import axios from 'axios';
import { URLSearchParams } from 'url';
import { ISelectorApiRepository } from '../../domain/selector-api/delete-selectors';
import Result from '../../domain/value-types/transient-types/result';

const apiRoot = 'http://localhost:3000/api/v1';

export default class SelectorApiRepositoryImpl implements ISelectorApiRepository {
  public deleteSelectors = async (params: URLSearchParams): Promise<Result<null>> => {
    try {
      const response = await axios.delete(`${apiRoot}/selectors`, {params});
      const jsonResponse = response.data;
      if (response.status === 200) return Result.ok<null>();
      throw new Error(jsonResponse);
    } catch (error) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);;
    }
  };
}
