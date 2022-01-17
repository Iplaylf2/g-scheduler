import { Task, Cancel } from "./common";

export class BalanceScheduler {
  constructor() {
    this.#status = Status.init;
    this.#taskSet = new Set();
  }

  async start(exceptionHandler?: (e: any) => any) {
    if (this.#status === Status.init) {
      this.#status = Status.running as Status; //for `this.#status === Status.over`

      while (true) {
        for (const task of this.#taskSet) {
          if (this.#status === Status.over) {
            break;
          }

          try {
            const { done } = await task.next();
            if (done) {
              this.#taskSet.delete(task);
            }
          } catch (e) {
            this.#taskSet.delete(task);
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
      this.#taskSet.clear();
      this.#status = Status.over;
    }
  }

  join(task: Task): Cancel;
  join(task: () => Task): Cancel;
  join(task: Task | (() => Task)): Cancel {
    const _task = task instanceof Function ? task() : task;

    this.#taskSet.add(_task);

    return () => this.#taskSet.delete(_task);
  }

  #status: Status;
  #taskSet: Set<Task>;
}

enum Status {
  init,
  running,
  over,
}
