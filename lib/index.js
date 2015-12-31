'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var workers = [];
var subscribers = {};
var IS_WORKER = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

if (IS_WORKER) {
  self.addEventListener('message', function (_ref) {
    var data = _ref.data;

    if (subscribers[data.key]) subscribers[data.key].forEach(function (fn) {
      return fn(data.data);
    });
  });
}

var addWorker = exports.addWorker = function addWorker(worker) {
  if (IS_WORKER) throw Error('You can\'t start a worker within a worker');
  // create worker from path
  if (typeof worker === 'string') worker = new Worker(worker);
  worker.addEventListener('message', function (_ref2) {
    var data = _ref2.data;
    return publish(data.key, data.data);
  });
  workers.push(worker);
};

var subscribe = exports.subscribe = function subscribe(key, fn) {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(fn);
};

var publish = exports.publish = function publish(key, data) {
  if (subscribers[key]) subscribers[key].forEach(function (fn) {
    return fn(data);
  });

  if (IS_WORKER) self.postMessage({ key: key, data: data });else workers.forEach(function (worker) {
    return worker.postMessage({ key: key, data: data });
  });
};
