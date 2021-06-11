// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import { IUseCase, Result } from '../shared';
import Id from '../value-types';
import { System, SystemProps } from '../entities';

export interface CreateSystemRequestDto {
  name: string;
}

// TODO Create and Read System are basically the same interface. Fix
export interface CreateSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
}

export type CreateSystemResponseDto = Result<CreateSystemDto | null>;

export interface ICreateSystemRepository {
  findByName(name: string): Promise<CreateSystemDto | null>;
  save(system: System): Promise<void>;
}

export class CreateSystem
  implements IUseCase<CreateSystemRequestDto, CreateSystemResponseDto>
{
  #createSystemRepository: ICreateSystemRepository;

  public constructor(createSystemRepository: ICreateSystemRepository) {
    this.#createSystemRepository = createSystemRepository;
  }

  public async execute(
    request: CreateSystemRequestDto
  ): Promise<CreateSystemResponseDto> {
    const system: Result<System | null> = this.#createSystem(request);
    if (!system.value) return system;

    try {
      const readSystemResult: CreateSystemDto | null =
        await this.#createSystemRepository.findByName(
          system.value.name
        );
      if (readSystemResult) return Result.fail<null>(`System ${readSystemResult.name} is already registered under ${readSystemResult.id}`);

      await this.#createSystemRepository.save(system.value);

      return Result.ok<CreateSystemDto>(
        this.#buildSystemDto(system.value)
      );
    } catch (error) {
      return Result.fail<CreateSystemDto>(error.message);
    }
  }

  #buildSystemDto = (system: System): CreateSystemDto => ({
    id: system.id,
    name: system.name,
    createdOn: system.createdOn,
    modifiedOn: system.modifiedOn
  });

  #createSystem = (
    request: CreateSystemRequestDto
  ): Result<System | null> => {
    const selectorProps: SystemProps = {
      id: Id.next(uuidv4).id,
      name: request.name
    };

    return System.create(selectorProps);
  };
}
