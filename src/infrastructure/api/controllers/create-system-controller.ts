// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { CreateSystem, CreateSystemRequestDto, CreateSystemResponseDto } from '../../../domain/system/create-system';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class CreateSystemController extends BaseController {
  #createSystem: CreateSystem;

  public constructor(createSystem: CreateSystem) {
    super();
    this.#createSystem = createSystem;
  }

  #buildRequestDto = (httpRequest: Request): CreateSystemRequestDto => ({
      name: httpRequest.body.name,
      organizationId: httpRequest.body.organizationId
    })


  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto : CreateSystemRequestDto = this.#buildRequestDto(req);
      const useCaseResult : CreateSystemResponseDto = await this.#createSystem.execute(requestDto);

      if (useCaseResult.error) {
        return CreateSystemController.badRequest(res, useCaseResult.error);
      }

      return CreateSystemController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error: any) {
      return CreateSystemController.fail(res, error);
    }
  }
}
