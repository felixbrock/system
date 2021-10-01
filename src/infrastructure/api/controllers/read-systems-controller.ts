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
      organizationId,
      warningCreatedOn,
      warningCreatedOnStart,
      warningCreatedOnEnd,
      warningSelectorId,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    } = httpRequest.query;

    const requestValid = this.#queryParametersValid([
      name,
      organizationId,
      warningCreatedOn,
      warningCreatedOnStart,
      warningCreatedOnEnd,
      warningSelectorId,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

   

    try {
      return Result.ok<ReadSystemsRequestDto>({
        name: typeof name === 'string' ? name : undefined,
        organizationId: typeof organizationId === 'string' ? organizationId : undefined,
        warning: {
          createdOnStart:
            typeof warningCreatedOnStart === 'string'
              ? this.#buildDate(warningCreatedOnStart)
              : undefined,
          createdOnEnd:
            typeof warningCreatedOnEnd === 'string'
              ? this.#buildDate(warningCreatedOnEnd)
              : undefined,
          selectorId:
          typeof warningSelectorId === 'string'
              ? warningSelectorId
              : undefined,
        },
        modifiedOnStart:
          typeof modifiedOnStart === 'string'
            ? this.#buildDate(modifiedOnStart)
            : undefined,
        modifiedOnEnd:
          typeof modifiedOnEnd === 'string'
            ? this.#buildDate(modifiedOnEnd)
            : undefined,
      });
    } catch (error: any) {
      return Result.fail<ReadSystemsRequestDto>(typeof error === 'string' ? error : error.message);
    }
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  #buildDate = (timestamp: string): number => {
    const date = timestamp.match(/[^T]*/s);
    const time = timestamp.match(/(?<=T)[^Z]*/s);

    if ((!date || !date[0] || date[0].length !== 8) || (!time || !time[0] || time[0].length !== 6))
      throw new Error(
        `${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`
      );

    const year = date[0].slice(0, 4);
    const month = date[0].slice(4, 6);
    const day = date[0].slice(6, 8);

    const hour = time[0].slice(0, 2);
    const minute = time[0].slice(2, 4);
    const second = time[0].slice(4, 6);

    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
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
    } catch (error: any) {
      return ReadSystemsController.fail(res, error);
    }
  }
}
