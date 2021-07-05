import Result from './transient-types/result';

export default class Warning {
  #createdOn: number;

  public get createdOn(): number {
    return this.#createdOn;
  }

  private constructor() {
    this.#createdOn = Date.now();
  }

  public static create(): Result<Warning | null> {
    const warning = new Warning();
    return Result.ok<Warning>(warning);
  }
}
