// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  ReadSystem,
  ReadSystemAuthDto,
  ReadSystemRequestDto,
  ReadSystemResponseDto,
} from '../../../domain/system/read-system';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class ReadSystemController extends BaseController {
  #readSystem: ReadSystem;

  #getAccounts: GetAccounts;

  public constructor(readSystem: ReadSystem, getAccounts: GetAccounts) {
    super();
    this.#readSystem = readSystem;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): ReadSystemRequestDto => ({
    id: httpRequest.params.systemId,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): ReadSystemAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return ReadSystemController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadSystemController.getUserAccountInfo(jwt, this.#getAccounts);

      if (!getUserAccountInfoResult.success)
        return ReadSystemController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: ReadSystemRequestDto = this.#buildRequestDto(req);
      const authDto: ReadSystemAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadSystemResponseDto =
        await this.#readSystem.execute(requestDto, authDto);

      if (!useCaseResult.success) {
        return ReadSystemController.badRequest(res, useCaseResult.error);
      }

      return ReadSystemController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: unknown) {
      if (typeof error === 'string')
        return ReadSystemController.fail(res, error);
      if (error instanceof Error) return ReadSystemController.fail(res, error);
      return ReadSystemController.fail(res, 'Unknown error occured');
    }
  }
}
