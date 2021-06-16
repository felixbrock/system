// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { CreateWarning, CreateWarningRequestDto, CreateWarningResponseDto } from '../../../domain/warning/create-warning';
import { BaseController, CodeHttp } from '../../shared';

export default class CreateWarningController extends BaseController {
  #createWarning: CreateWarning;

  public constructor(createWarning: CreateWarning) {
    super();
    this.#createWarning = createWarning;
  }

  #buildRequestDto = (httpRequest: Request): CreateWarningRequestDto => ({
      systemId: httpRequest.body.systemId,
    })

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto : CreateWarningRequestDto = this.#buildRequestDto(req);
      const useCaseResult : CreateWarningResponseDto = await this.#createWarning.execute(requestDto);

      if (useCaseResult.error) {
        return CreateWarningController.badRequest(res, useCaseResult.error);
      }

      return CreateWarningController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error) {
      return CreateWarningController.fail(res, error);
    }
  }
}
