"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Defer() {
    this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}
exports.default = Defer;
