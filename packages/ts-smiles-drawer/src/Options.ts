export class Options {
  /**
   * A helper method to extend the default options with user supplied ones.
   */
  static extend() {
    const that = this;
    const extended: Record<string, any> = {};
    let deep = false;
    let i = 0;
    const length = arguments.length;

    if (Object.prototype.toString.call(arguments[0]) === "[object Boolean]") {
      deep = arguments[0];
      i++;
    }

    const merge = function (obj: any) {
      for (const prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          if (
            deep &&
            Object.prototype.toString.call(obj[prop]) === "[object Object]"
          ) {
            //@ts-ignore
            extended[prop] = that.extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    for (; i < length; i++) {
      const obj = arguments[i];
      merge(obj);
    }

    return extended;
  }
}
