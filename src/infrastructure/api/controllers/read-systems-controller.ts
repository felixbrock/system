// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSystems,
  ReadSystemsRequestDto,
  ReadSystemsResponseDto,
} from '../../../domain/system/read-systems';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadSystemsController extends BaseController {
  #readSystems: ReadSystems;

  public constructor(readSystems: ReadSystems) {
    super();
    this.#readSystems = readSystems;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<ReadSystemsRequestDto> => {
    const { name, warningCreatedOn, modifiedOn } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      name,
      warningCreatedOn,
      modifiedOn,
    ]);
    if (!requestValid)
      return Result.fail<ReadSystemsRequestDto>(
        'Request query parameter are supposed to be in string format'
      );

    try {
      return Result.ok<ReadSystemsRequestDto>({
        name:
        typeof name === 'string' ? name : undefined,
        warning: {
          createdOn:
            typeof warningCreatedOn === 'string' ? parseInt(warningCreatedOn, 10) : undefined,
        },
        modifiedOn:
          typeof modifiedOn === 'string' ? parseInt(modifiedOn, 10) : undefined,
      });
      
    } catch (error) {
      return Result.fail<ReadSystemsRequestDto>(error.message);
    }

    
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<ReadSystemsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadSystemsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadSystemsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: ReadSystemsResponseDto =
        await this.#readSystems.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return ReadSystemsController.badRequest(res, useCaseResult.error);
      }

      return ReadSystemsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error) {
      return ReadSystemsController.fail(res, error);
    }
  }
}
