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

  #buildRequestDto = (httpRequest: Request): Result<ReadSystemsRequestDto> => {
    const {
      name,
      warningCreatedOn,
      alertCreatedOnStart,
      alertCreatedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      name,
      warningCreatedOn,
      alertCreatedOnStart,
      alertCreatedOnEnd,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

    const startTime = '00:00:00';
    const endTime = '23:59:59';

    if (
      typeof timezoneOffset === 'string' &&
      timezoneOffset.indexOf('-') === -1 &&
      timezoneOffset.indexOf('+') === -1
    )
      throw new Error(
        `TimezoneOffset is not in correct format. '-' or '+' missing. Make sure to use URL encoding ('-'; '%2B' for '+' character)`
      );

    try {
      return Result.ok<ReadSystemsRequestDto>({
        name: typeof name === 'string' ? name : undefined,
        warning: {
          createdOnStart:
            typeof alertCreatedOnStart === 'string'
              ? Date.parse(
                  `${alertCreatedOnStart} ${startTime} ${timezoneOffset || ''}`
                )
              : undefined,
          createdOnEnd:
            typeof alertCreatedOnEnd === 'string'
              ? Date.parse(
                  `${alertCreatedOnEnd} ${endTime} ${timezoneOffset || ''}`
                )
              : undefined,
        },
        modifiedOnStart:
          typeof modifiedOnStart === 'string'
            ? Date.parse(
                `${modifiedOnStart} ${startTime} ${timezoneOffset || ''}`
              )
            : undefined,
        modifiedOnEnd:
          typeof modifiedOnEnd === 'string'
            ? Date.parse(`${modifiedOnEnd} ${endTime} ${timezoneOffset || ''}`)
            : undefined,
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
