export class GeneratePostUseCase {
  static #instance: GeneratePostUseCase;

  private constructor() {
  }

  static get instance(): GeneratePostUseCase {
    if (!GeneratePostUseCase.#instance) {
      GeneratePostUseCase.#instance = new GeneratePostUseCase();
    }
    return GeneratePostUseCase.#instance;
  }

  async execute(): Promise<void> {

  }
}
