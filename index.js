(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    data = JSON.parse(data);
    if (subscribers[data.key]) subscribers[data.key].forEach(function (fn) {
      return fn(data.data);
    });
  });
}

var addWorker = exports.addWorker = function addWorker(worker) {
  // create worker from path
  if (typeof worker === 'string') worker = new Worker(worker);
  worker.addEventListener('message', function (_ref2) {
    var data = _ref2.data;

    data = JSON.parse(data);
    publish(data.key, data.data);
  }, false);
  workers.push(worker);
};

var subscribe = exports.subscribe = function subscribe(key, fn) {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(fn);
};

var publish = exports.publish = function publish(key, data) {
  var json = JSON.stringify({ key: key, data: data });
  if (IS_WORKER) self.postMessage(json);
  workers.forEach(function (worker) {
    return worker.postMessage(json);
  });
  if (subscribers[key]) subscribers[key].forEach(function (fn) {
    return fn(data);
  });
};

},{}]},{},[1]);
