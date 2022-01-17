import { BalanceScheduler, TimeLimitScheduler } from "g-scheduler";

var scheduler = new TimeLimitScheduler();
scheduler.join(async function* () {
  while (true) {
    console.log("zzzz");
    await new Promise((resolve) => setTimeout(resolve, 100));
    yield;
  }
}, 0);
scheduler.join(function* () {
  console.log(111);
  yield;
  console.log(222);
  yield;
  console.log(3333);
  yield;
  console.log(444);
}, 1);
