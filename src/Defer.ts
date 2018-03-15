function Defer<T>() {
  this.promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve; this.reject = reject;
  });
}

export default Defer;
