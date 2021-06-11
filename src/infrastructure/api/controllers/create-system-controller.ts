// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { CreateSystem, CreateSystemRequestDto, CreateSystemResponseDto } from '../../../domain/use-cases/create-system';
import { BaseController, CodeHttp } from '../../shared';

export default class CreateSystemController extends BaseController {
  #createSystem: CreateSystem;

  public constructor(createSystem: CreateSystem) {
    super();
    this.#createSystem = createSystem;
  }

  #buildRequestDto = (httpRequest: Request): CreateSystemRequestDto => ({
      name: httpRequest.body.name
    })


  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto : CreateSystemRequestDto = this.#buildRequestDto(req);
      const useCaseResult : CreateSystemResponseDto = await this.#createSystem.execute(requestDto);

      if (useCaseResult.error) {
        return CreateSystemController.badRequest(res, useCaseResult.error);
      }

      return CreateSystemController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error) {
      return CreateSystemController.fail(res, error);
    }
  }
}
