export default class Result<T> {
  #error?: string;

  #success: boolean;
  
  #value?: T;

  private constructor(success: boolean, value?: T, error?: string) {
    this.#error = error;
    this.#success = success;
    this.#value = value;
  }

  public get error(): string | undefined {
    return this.#error;
  }

  public get success(): boolean {
    return this.#success;
  }

  public get value(): T | undefined {
    if (!this.#success)
      throw new Error(
        `An error occured. Cannot get the value of an error result: ${
          this.#error
        }`
      );
    return this.#value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, value, undefined);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, undefined, error);
  }
}
