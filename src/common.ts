export type Task = Generator | AsyncGenerator;

export interface Cancel {
  (): void;
}
