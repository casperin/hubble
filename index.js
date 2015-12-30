var workers = [];
var subscribers = {};
var IS_WORKER = typeof WorkerGlobalScope !== 'undefined'
                && self instanceof WorkerGlobalScope;

if (IS_WORKER) {
  self.addEventListener('message', function (e) {
    var data = JSON.parse(e.data);
    if (subscribers[data.key]) {
      subscribers[data.key].forEach(function (fn) {
        fn(data.data)
      });
    }
  });
}

function addWorker (worker) {
  // create worker from path
  if (typeof worker === 'string') worker = new Worker(worker);
  worker.addEventListener('message', function (e) {
    var data = JSON.parse(e.data);
    publish(data.key, data.data)
  }, false);
  workers.push(worker);
}

function subscribe (key, fn) {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(fn);
}

function publish (key, data) {
  var json = JSON.stringify({key: key, data: data});
  if (IS_WORKER) self.postMessage(json);
  workers.forEach(function (worker) {
    worker.postMessage(json)
  });
  if (subscribers[key]) {
    subscribers[key].forEach(function (fn) {
      fn(data)
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports.addWorker = addWorker;
    module.exports.subscribe = subscribe;
    module.exports.publish = publish;
}
