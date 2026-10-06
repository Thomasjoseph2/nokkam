/** Time source. Injected so domain rules (expiry, schedules) are testable. */
export abstract class Clock {
  abstract now(): Date;
}
