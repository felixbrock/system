// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateSystem,
  CreateSystemAuthDto,
  CreateSystemRequestDto,
  CreateSystemResponseDto,
} from '../../../domain/system/create-system';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateSystemController extends BaseController {
  #createSystem: CreateSystem;

  #getAccounts: GetAccounts;

  public constructor(createSystem: CreateSystem, getAccounts: GetAccounts) {
    super();
    this.#createSystem = createSystem;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (req: Request): CreateSystemRequestDto => ({
    name: req.body.name,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): CreateSystemAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;    

      if (!authHeader)
        return CreateSystemController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];
    
      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateSystemController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateSystemController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: CreateSystemRequestDto = this.#buildRequestDto(req);
      const authDto: CreateSystemAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateSystemResponseDto =
        await this.#createSystem.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return CreateSystemController.badRequest(res, useCaseResult.error);
      }

      return CreateSystemController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if (typeof error === 'string')
        return CreateSystemController.fail(res, error);
      if (error instanceof Error)
        return CreateSystemController.fail(res, error);
      return CreateSystemController.fail(res, 'Unknown error occured');
    }
  }
}
