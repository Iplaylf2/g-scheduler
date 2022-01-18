# g-scheduler

基于 generator 的调度器。

## [English](https://github.com/Iplaylf2/g-scheduler/blob/main/README.md) | 中文

## 安装

```bash
npm install g-scheduler
```

## 用例

```typescript
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

```typescript
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

## 原理

调度器是根据 generator 切割 task 的。task 执行到了 `yield` 的时候，调度器会暂停下来做一些检查，以此作为是否要切换到下一个 task 的依据。

- BalanceScheduler 总是切换到下一个 task。
- TimeLimitScheduler 会根据设置的超时时间来决定是否切换。

## api

### exceptionHandler

在构造调度器时可以传入 `exceptionHandler`，它将捕获执行 task 时抛出的异常。

一旦 task 抛出异常，它将会从调度器中移除。

```typescript
new BalanceScheduler((e) => console.error(e));
new TimeLimitScheduler((e) => console.error(e));
```

### join

把 task 托管给调度器。它能接受 `Generator` 或 `GeneratorFunction` 作为参数。

join 函数的返回值可以用来取消传入的 task。

```typescript
const cancel = scheduler.join(task);
cancel();
```

### stop

取消所有的 task 并废弃掉当前的调度器。
