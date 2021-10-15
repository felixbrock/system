import { Warning } from '../value-types/warning';

export interface SystemProperties {
  id: string;
  name: string;
  organizationId: string;
  modifiedOn?: number;
  warnings?: Warning[];
}

export class System {
  #id: string;

  #name: string;

  #organizationId: string;

  #warnings: Warning[];

  #modifiedOn: number;

  public get id(): string {
    return this.#id;
  }

  public get name(): string {
    return this.#name;
  }

  public set name(name: string) {
    if (!name) throw new Error('System must have name');

    this.#name = name;
  }

  public get organizationId(): string {
    return this.#organizationId;
  }

  public set organizationId(organizationId: string) {
    if (!organizationId) throw new Error('System must have organizationId');

    this.#organizationId = organizationId;
  }

  public get warnings(): Warning[] {
    return this.#warnings;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: SystemProperties) {
    this.#id = properties.id;
    this.#name = properties.name;
    this.#organizationId = properties.organizationId;
    this.#warnings = properties.warnings || [];
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  public static create(properties: SystemProperties): System {
    if (!properties.id) throw new Error('System must have id');
    if (!properties.name) throw new Error('System must have name');
    if (!properties.organizationId)
      throw new Error('System must have organizationId');

    return new System(properties);
  }

  public addWarning(warning: Warning): void {
    this.#warnings.push(warning);
  }
}
