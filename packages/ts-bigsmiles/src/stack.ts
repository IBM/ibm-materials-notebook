import { logger } from "./logger";

export class Stack<T> {
  private _stack: T[] = [];

  get size() {
    return this._stack.length;
  }

  public isEmpty() {
    return this._stack.length === 0;
  }

  public push(item: T) {
    this._stack.push(item);
  }

  public pop() {
    return this._stack.pop();
  }

  /**
   * Returns item at index from top of the stack. Stack is 1-indexed.
   * @param item number
   * @returns T
   */
  public peek(item: number = 1) {
    if (this.isEmpty()) {
      throw new Error(`Stack is empty!`);
    }

    const index = this._stack.length - item;

    if (index < 0) {
      return this._stack[0];
    }

    return this._stack[index];
  }

  public print() {
    let text = "[";
    for (const item of this._stack) {
      text = `${text}\n${String(item)}`;
    }
    text = `${text}\n]`;
    return text;
  }

  *[Symbol.iterator]() {
    for (let i = this._stack.length - 1; i >= 0; i--) {
      const item = this._stack[i];
      yield item;
    }
  }
}
