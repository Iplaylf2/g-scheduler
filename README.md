# g-scheduler

Scheduler base on generator.

English | [中文](https://github.com/Iplaylf2/g-scheduler/blob/main/doc/README.cn.md)
-

## install

``` bash
npm install g-scheduler
```

## usage

``` typescript
import { BalanceScheduler } from "g-scheduler";

const scheduler = new BalanceScheduler();

const task1 = function* () {
  for (let i = 0; i != 3; i++) {
    console.log(`task1: ${i}`);
    yield;
  }
};

const task2 = function* () {
  for (let i = 0; i != 3; i++) {
    console.log(`task2: ${i}`);
    yield;
  }
};

scheduler.join(task1);
scheduler.join(task2);

/*
task1: 0
task2: 0
task1: 1
task2: 1
task1: 2
task2: 2
*/

```

``` typescript
import { TimeLimitScheduler } from "g-scheduler";

const delay = function (ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const scheduler = new TimeLimitScheduler();

const task1 = async function* () {
  for (let i = 0; i != 3; i++) {
    await delay(90);
    console.log(`task1: ${i}`);
    yield;
  }
};

const task2 = async function* () {
  for (let i = 0; i != 3; i++) {
    await delay(90);
    console.log(`task2: ${i}`);
    yield;
  }
};

scheduler.join(task1, 200);
scheduler.join(task2, 300);

/*
task1: 0
task1: 1
task2: 0
task2: 1
task2: 2
task1: 2
*/

```

## principle

The scheduler splits task by generator. If the task execute `yield`, scheduler pauses and makes some check to detect whether to switch to next task.

- BalanceScheduler always switch to next task.
- TimeLimitScheduler will switch to next task by checking for timeout.

## api

### exceptionHandler

Pass `exceptionHandler` to scheduler constructor for handling the exception which throw by the task.

Once a tasks throw an exception, the scheduler remove it.

``` typescript
new BalanceScheduler((e) => console.error(e));
new TimeLimitScheduler((e) => console.error(e));

```

### join

Add task to scheduler.It can accept `Generator` or `GeneratorFunction`.

The return of `join` is a function for canceling current task.

``` typescript
const cancel = scheduler.join(task);
cancel();

```

### stop

Cancel all task and drop the scheduler.