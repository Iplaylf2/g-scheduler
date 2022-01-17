import { Cancel, Task } from "./common";
import { performance } from "perf_hooks";

export class TimeLimitScheduler {
  constructor() {
    this.#status = Status.init;
    this.#taskMap = new Map();
  }

  async start(exceptionHandler?: (e: any) => any) {
    if (this.#status === Status.init) {
      this.#status = Status.running as Status; //for `this.#status === Status.over`

      while (true) {
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
            if (exceptionHandler) {
              exceptionHandler(e);
            } else {
              this.stop();
              throw e;
            }
          }
        }
      }
    } else {
      throw this.#status;
    }
  }

  stop() {
    if (this.#status === Status.over) {
      throw this.#status;
    } else {
      this.#taskMap.clear();
      this.#status = Status.over;
    }
  }

  join(task: Task, limit: number): Cancel;
  join(task: () => Task, limit: number): Cancel;
  join(task: Task | (() => Task), limit: number): Cancel {
    const _task = task instanceof Function ? task() : task;

    this.#taskMap.set(_task, limit);

    return () => this.#taskMap.delete(_task);
  }

  #status: Status;
  #taskMap: Map<Task, number>;
}

enum Status {
  init,
  running,
  over,
}
