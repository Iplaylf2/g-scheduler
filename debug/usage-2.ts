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
