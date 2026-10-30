// Plays a prepared journey through layers with clock control and commit management.
// Uses js/engine/journey.js and js/events.js.
// Used by panel.js, stage.js, and selftest.js.

import { prepare } from "./engine/journey.js";
import { emit } from "./events.js";

const defaultClock = {
  now: () => (typeof performance !== "undefined" ? performance.now() : Date.now()),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id)
};

export class Player {
  /**
   * @param {object} options
   * @param {object} options.journey
   * @param {Array} options.layers
   * @param {object} options.values
   * @param {number} [options.speed=1]
   * @param {Function} [options.commit]
   * @param {object} [options.clock]
   * @param {boolean} [options.autoPlay=true]
   * @param {Function} [options.onStep]
   * @param {Function} [options.onComplete]
   */
  constructor(options) {
    this.journey = options.journey;
    this.layers = options.layers;
    this.values = options.values;
    this.speed = options.speed || 1;
    this.commitFn = typeof options.commit === "function" ? options.commit : () => {};
    this.clock = options.clock || defaultClock;
    this.autoPlay = options.autoPlay !== false;

    this.onStep = options.onStep || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.steps = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.isEnded = false;
    this.commitCalled = false;
    this.commitTime = null;

    this.timerId = null;
    this.stepStartTime = 0;
    this.stepRemaining = 0;

    this._prepareSteps();
  }

  _prepareSteps() {
    this.steps = prepare(this.journey, this.layers, this.values, this.speed);
  }

  get currentStep() {
    return this.steps[this.currentStepIndex] || null;
  }

  start() {
    this.currentStepIndex = 0;
    this.isPlaying = true;
    this.isEnded = false;
    this.commitCalled = false;
    this.commitTime = null;
    this._runStep(0);
  }

  _runStep(index) {
    if (this.timerId !== null) {
      this.clock.clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (index >= this.steps.length) {
      this._finish();
      return;
    }

    this.currentStepIndex = index;
    const step = this.steps[index];

    // Commit rule: if this step has commit: true, call commit() exactly once
    if (step.commit && !this.commitCalled) {
      this._triggerCommit(step);
    }

    this.stepStartTime = this.clock.now();
    this.stepRemaining = step.duration;

    this.onStep(step, index);
    emit("player:step", { step, index, total: this.steps.length });

    if (this.autoPlay && this.isPlaying) {
      this.timerId = this.clock.setTimeout(() => {
        this.timerId = null;
        if (index + 1 < this.steps.length) {
          this._runStep(index + 1);
        } else {
          this._finish();
        }
      }, this.stepRemaining);
    }
  }

  _triggerCommit(step) {
    this.commitCalled = true;
    this.commitTime = this.clock.now();
    try {
      this.commitFn();
    } catch (e) {
      // Catch error in commit callback to prevent player stoppage
    }
    emit("player:commit", { step });
  }

  _finish() {
    this.isPlaying = false;
    this.isEnded = true;
    this.timerId = null;
    this.onComplete(this.journey);
    emit("player:complete", { journey: this.journey });
  }

  pause() {
    if (!this.isPlaying || this.isEnded) return;

    if (this.timerId !== null) {
      this.clock.clearTimeout(this.timerId);
      this.timerId = null;
    }

    const elapsed = this.clock.now() - this.stepStartTime;
    this.stepRemaining = Math.max(0, this.stepRemaining - elapsed);
    this.isPlaying = false;

    emit("player:pause", { index: this.currentStepIndex });
  }

  play() {
    if (this.isPlaying) return;
    if (this.isEnded) {
      this.replay();
      return;
    }

    this.isPlaying = true;
    this.stepStartTime = this.clock.now();

    emit("player:play", { index: this.currentStepIndex });

    if (this.autoPlay) {
      this.timerId = this.clock.setTimeout(() => {
        this.timerId = null;
        if (this.currentStepIndex + 1 < this.steps.length) {
          this._runStep(this.currentStepIndex + 1);
        } else {
          this._finish();
        }
      }, this.stepRemaining);
    }
  }

  next() {
    if (this.isEnded) return;

    const nextIndex = this.currentStepIndex + 1;
    if (nextIndex < this.steps.length) {
      // Section 6H: If the visitor uses Next past commit step, call it then
      const nextStep = this.steps[nextIndex];
      if (nextStep.commit && !this.commitCalled) {
        this._triggerCommit(nextStep);
      }
      this._runStep(nextIndex);
    } else {
      this._finish();
    }
  }

  prev() {
    if (this.currentStepIndex > 0) {
      // Previous never undoes commit (Section 6H)
      this._runStep(this.currentStepIndex - 1);
    }
  }

  setSpeed(newSpeed) {
    if (newSpeed <= 0 || newSpeed === this.speed) return;
    const oldSpeed = this.speed;
    this.speed = newSpeed;

    const elapsed = this.clock.now() - this.stepStartTime;
    const progressRatio = this.steps[this.currentStepIndex] ? Math.min(1, elapsed / this.steps[this.currentStepIndex].duration) : 0;

    this._prepareSteps();

    if (this.isPlaying && this.timerId !== null) {
      this.clock.clearTimeout(this.timerId);
      const newDuration = this.steps[this.currentStepIndex].duration;
      this.stepRemaining = Math.max(0, newDuration * (1 - progressRatio));
      this.stepStartTime = this.clock.now();

      this.timerId = this.clock.setTimeout(() => {
        this.timerId = null;
        if (this.currentStepIndex + 1 < this.steps.length) {
          this._runStep(this.currentStepIndex + 1);
        } else {
          this._finish();
        }
      }, this.stepRemaining);
    }
  }

  replay() {
    this.start();
  }

  close() {
    if (this.timerId !== null) {
      this.clock.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isPlaying = false;
    emit("player:close");
  }
}

/**
 * Factory helper to create a player instance.
 * @param {object} options
 * @returns {Player}
 */
export function createPlayer(options) {
  return new Player(options);
}
