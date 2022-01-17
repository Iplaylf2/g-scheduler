import { Cancel, Task } from "./common";
import { performance } from "perf_hooks";

export class TimeLimitScheduler {
  constructor(exceptionHandler?: (e: any) => any) {
    this.#exceptionHandler = exceptionHandler;
    this.#status = Status.sleep;
    this.#taskMap = new Map();
  }

  join(task: Task, limit: number): Cancel;
  join(task: () => Task, limit: number): Cancel;
  join(task: Task | (() => Task), limit: number): Cancel {
    const _task = task instanceof Function ? task() : task;

    this.#taskMap.set(_task, limit);

    if (this.#status === Status.sleep) {
      this.start();
    }

    return () => this.#taskMap.delete(_task);
  }

  stop() {
    if (this.#status === Status.over) {
      throw this.#status;
    } else {
      this.#taskMap.clear();
      this.#status = Status.over;
    }
  }

  async start() {
    if (this.#status === Status.sleep) {
      this.#status = Status.run as Status; //for `this.#status === Status.over`

      do {
        for (const [task, limit] of this.#taskMap) {
          if (this.#status === Status.over) {
            break;
          }

          let now = performance.now();
          try {
            do {
              const { done } = await task.next();
              if (done) {
                this.#taskMap.delete(task);
                break;
              }
            } while (performance.now() - now < limit);
          } catch (e) {
            this.#taskMap.delete(task);
            if (this.#exceptionHandler) {
              this.#exceptionHandler(e);
            } else {
              this.stop();
              throw e;
            }
          }
        }
      } while (0 < this.#taskMap.size);

      this.#status = Status.sleep;
    } else {
      throw this.#status;
    }
  }

  #exceptionHandler?: (e: any) => any;
  #status: Status;
  #taskMap: Map<Task, number>;
}

enum Status {
  sleep,
  run,
  over,
}
