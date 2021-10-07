// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteSystem,
  DeleteSystemAuthDto,
  DeleteSystemRequestDto,
  DeleteSystemResponseDto,
} from '../../../domain/system/delete-system';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteSystemController extends BaseController {
  #deleteSystem: DeleteSystem;

  #getAccounts: GetAccounts;

  public constructor(deleteSystem: DeleteSystem, getAccounts: GetAccounts) {
    super();
    this.#deleteSystem = deleteSystem;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSystemRequestDto => ({
    id: httpRequest.params.systemId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo,
    jwt: string
  ): DeleteSystemAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    jwt,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return DeleteSystemController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteSystemController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteSystemController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: DeleteSystemRequestDto = this.#buildRequestDto(req);
      const authDto: DeleteSystemAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        token
      );

      const useCaseResult: DeleteSystemResponseDto =
        await this.#deleteSystem.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return DeleteSystemController.badRequest(res, useCaseResult.error);
      }

      return DeleteSystemController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return DeleteSystemController.fail(res, error);
    }
  }
}
