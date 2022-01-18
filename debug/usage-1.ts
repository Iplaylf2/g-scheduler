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
