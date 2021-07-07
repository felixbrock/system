import Result from './transient-types/result';

export interface WarningProperties {
  createdOn?: number;
}

export class Warning {
  #createdOn: number;

  public get createdOn(): number {
    return this.#createdOn;
  }

  private constructor(properties: WarningProperties) {
    this.#createdOn = properties.createdOn || Date.now();
  }

  public static create(properties: WarningProperties): Result<Warning | null> {
    const warning = new Warning(properties);
    return Result.ok<Warning>(warning);
  }
}
