// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  ReadSystems,
  ReadSystemsAuthDto,
  ReadSystemsRequestDto,
  ReadSystemsResponseDto,
} from '../../../domain/system/read-systems';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadSystemsController extends BaseController {
  #readSystems: ReadSystems;

  #getAccounts: GetAccounts;

  public constructor(readSystems: ReadSystems, getAccounts: GetAccounts) {
    super();
    this.#readSystems = readSystems;
    this.#getAccounts = getAccounts;
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
      return Result.ok({
        name: typeof name === 'string' ? name : undefined,
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
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
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

    if (
      !date ||
      !date[0] ||
      date[0].length !== 8 ||
      !time ||
      !time[0] ||
      time[0].length !== 6
    )
      throw new Error(`${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`);

    const year = date[0].slice(0, 4);
    const month = date[0].slice(4, 6);
    const day = date[0].slice(6, 8);

    const hour = time[0].slice(0, 2);
    const minute = time[0].slice(2, 4);
    const second = time[0].slice(4, 6);

    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  };

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadSystemsAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadSystemsController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadSystemsController.getUserAccountInfo(jwt, this.#getAccounts);

      if (!getUserAccountInfoResult.success)
        return ReadSystemsController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: Result<ReadSystemsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadSystemsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadSystemsController.badRequest(
          res,
          'Invalid request query parameters'
        );

      const authDto: ReadSystemsAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadSystemsResponseDto =
        await this.#readSystems.execute(buildDtoResult.value, authDto);

      if (useCaseResult.error) {
        return ReadSystemsController.badRequest(res, useCaseResult.error);
      }

      return ReadSystemsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: unknown) {
      if (typeof error === 'string')
        return ReadSystemsController.fail(res, error);
      if (error instanceof Error) return ReadSystemsController.fail(res, error);
      return ReadSystemsController.fail(res, 'Unknown error occured');
    }
  }
}
