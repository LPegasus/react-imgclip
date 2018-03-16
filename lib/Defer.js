"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function Defer() {
  var _this = this;

  this.promise = new Promise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
}

exports.default = Defer;
module.exports = exports["default"];