// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import Result from '../../../domain/value-types/transient-types/result';
import {
  CreateWarning,
  CreateWarningRequestDto,
  CreateWarningResponseDto,
} from '../../../domain/warning/create-warning';
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
    const { systemId } = httpRequest.params;
    const { selectorId } = httpRequest.body.data;
    if (systemId)
      return Result.ok<CreateWarningRequestDto>({
        systemId,
        selectorId,
      });
    return Result.fail<CreateWarningRequestDto>(
      'Cannot find request parameter systemId'
    );
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<CreateWarningRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return CreateWarningController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return CreateWarningController.badRequest(
          res,
          'Invalid request paramerters'
        );

      const useCaseResult: CreateWarningResponseDto =
        await this.#createWarning.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return CreateWarningController.badRequest(res, useCaseResult.error);
      }

      return CreateWarningController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: any) {
      return CreateWarningController.fail(res, error);
    }
  }
}
