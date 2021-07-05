// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import Result from '../../../domain/value-types/transient-types/result';
import { CreateWarning, CreateWarningRequestDto, CreateWarningResponseDto } from '../../../domain/warning/create-warning';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class CreateWarningController extends BaseController {
  #createWarning: CreateWarning;

  public constructor(createWarning: CreateWarning) {
    super();
    this.#createWarning = createWarning;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<CreateWarningRequestDto> => {
    const { systemId } = httpRequest.query;
    if (typeof systemId === 'string')
      return Result.ok<CreateWarningRequestDto>({
        systemId,
      });
    return Result.fail<CreateWarningRequestDto>(
      'request query parameter subscriptionId is supposed to be in string format'
    );
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<CreateWarningRequestDto> = this.#buildRequestDto(req);

      if(buildDtoResult.error) return CreateWarningController.badRequest(res, buildDtoResult.error);
      if(!buildDtoResult.value) return CreateWarningController.badRequest(res, 'Invalid request query paramerters');

      const useCaseResult : CreateWarningResponseDto = await this.#createWarning.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return CreateWarningController.badRequest(res, useCaseResult.error);
      }

      return CreateWarningController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error) {
      return CreateWarningController.fail(res, error);
    }
  }
}
