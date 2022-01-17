import { Task, Cancel } from "./common";

export class BalanceScheduler {
  constructor(exceptionHandler?: (e: any) => any) {
    this.#exceptionHandler = exceptionHandler;
    this.#status = Status.sleep;
    this.#taskSet = new Set();
  }

  join(task: Task): Cancel;
  join(task: () => Task): Cancel;
  join(task: Task | (() => Task)): Cancel {
    if (this.#status === Status.over) {
      throw this.#status;
    }

    const _task = task instanceof Function ? task() : task;

    this.#taskSet.add(_task);

    if (this.#status === Status.sleep) {
      this.start();
    }

    return () => this.#taskSet.delete(_task);
  }

  stop() {
    if (this.#status === Status.over) {
      throw this.#status;
    } else {
      this.#taskSet.clear();
      this.#status = Status.over;
    }
  }

  private async start() {
    if (this.#status === Status.sleep) {
      this.#status = Status.run as Status; //for `this.#status === Status.over`
      do {
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
            if (this.#exceptionHandler) {
              this.#exceptionHandler(e);
            } else {
              this.stop();
              throw e;
            }
          }
        }
      } while (0 < this.#taskSet.size);

      this.#status = Status.sleep;
    } else {
      throw this.#status;
    }
  }

  #exceptionHandler?: (e: any) => any;
  #status: Status;
  #taskSet: Set<Task>;
}

enum Status {
  sleep,
  run,
  over,
}
