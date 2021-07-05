// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadSystem,
  ReadSystemRequestDto,
  ReadSystemResponseDto,
} from '../../../domain/system/read-system';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadSystemController extends BaseController {
  #readSystem: ReadSystem;

  public constructor(readSystem: ReadSystem) {
    super();
    this.#readSystem = readSystem;
  }

  #buildRequestDto = (httpRequest: Request): ReadSystemRequestDto => ({
    id: httpRequest.params.systemId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadSystemRequestDto = this.#buildRequestDto(req);
      const useCaseResult: ReadSystemResponseDto =
        await this.#readSystem.execute(requestDto);

      if (useCaseResult.error) {
        return ReadSystemController.badRequest(res, useCaseResult.error);
      }

      return ReadSystemController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadSystemController.fail(res, error);
    }
  }
}
