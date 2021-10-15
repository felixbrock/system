// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import Result from '../../../domain/value-types/transient-types/result';
import {
  CreateWarning,
  CreateWarningAuthDto,
  CreateWarningRequestDto,
  CreateWarningResponseDto,
} from '../../../domain/warning/create-warning';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateWarningController extends BaseController {
  #createWarning: CreateWarning;

  #getAccounts: GetAccounts;

  public constructor(createWarning: CreateWarning, getAccounts: GetAccounts) {
    super();
    this.#createWarning = createWarning;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (req: Request): CreateWarningRequestDto => {
    const { systemId } = req.params;
    const { selectorId } = req.body;
    if (!systemId) throw new Error('Cannot find request parameter systemId');

    return {
      systemId,
      selectorId,
    };
  };

  #buildAuthDto = (userAccountInfo: UserAccountInfo): CreateWarningAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return CreateWarningController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateWarningController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateWarningController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const buildDtoResult: CreateWarningRequestDto =
        this.#buildRequestDto(req);

      const authDto: CreateWarningAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateWarningResponseDto =
        await this.#createWarning.execute(buildDtoResult, authDto);

      if (!useCaseResult.success) {
        return CreateWarningController.badRequest(res, useCaseResult.error);
      }

      return CreateWarningController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return CreateWarningController.fail(res, error);
      if (error instanceof Error)
        return CreateWarningController.fail(res, error);
      return CreateWarningController.fail(res, 'Unknown error occured');
    }
  }
}
