
export interface WarningProperties {
  createdOn?: number;
  selectorId: string;
}

export class Warning {
  #createdOn: number;

  #selectorId: string;

  public get createdOn(): number {
    return this.#createdOn;
  }

  public get selectorId(): string {
    return this.#selectorId;
  }

  private constructor(properties: WarningProperties) {
    this.#selectorId = properties.selectorId;
    this.#createdOn = properties.createdOn || Date.now();
  }

  public static create(properties: WarningProperties): Warning {
    if (!properties.selectorId)
      throw new Error('Warning must contain corresponding selector id');

    return new Warning(properties);
  }
}
