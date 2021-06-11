import { Result } from '../shared';

export interface SystemProps {
  id: string;
  name: string;
}

export class System {
  #createdOn: number;

  #id: string;

  #modifiedOn: number;

  #name: string;

  public get createdOn(): number {
    return this.#createdOn;
  }

  public get id(): string {
    return this.#id;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public get name(): string {
    return this.#name;
  }

  private constructor(props: SystemProps) {
    this.#createdOn = Date.now();
    this.#id = props.id;
    this.#modifiedOn = Date.now();
    this.#name = props.name;
  }

  public static create(props: SystemProps): Result<System> {
    if (!props.id) return Result.fail('System must have id');
    if (!props.name) return Result.fail('System must have name');

    const system = new System(props);
    return Result.ok<System>(system);
  }
}
