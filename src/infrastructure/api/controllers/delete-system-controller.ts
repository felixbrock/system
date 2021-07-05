// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteSystem,
  DeleteSystemRequestDto,
  DeleteSystemResponseDto,
} from '../../../domain/system/delete-system';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class DeleteSystemController extends BaseController {
  #deleteSystem: DeleteSystem;

  public constructor(deleteSystem: DeleteSystem) {
    super();
    this.#deleteSystem = deleteSystem;
  }

  #buildRequestDto = (httpRequest: Request): DeleteSystemRequestDto => ({
    id: httpRequest.params.systemId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: DeleteSystemRequestDto =
        this.#buildRequestDto(req);

      const useCaseResult: DeleteSystemResponseDto =
        await this.#deleteSystem.execute(requestDto);

      if (useCaseResult.error) {
        return DeleteSystemController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return DeleteSystemController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return DeleteSystemController.fail(res, error);
    }
  }
}
