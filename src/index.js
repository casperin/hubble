const workers = [];
const subscribers = {};
const IS_WORKER = typeof WorkerGlobalScope !== 'undefined'
                  && self instanceof WorkerGlobalScope;

if (IS_WORKER) {
  self.addEventListener('message', ({data}) => {
    if (subscribers[data.key])
      subscribers[data.key].forEach(fn => fn(data.data));
  });
}

export const addWorker = worker => {
  if (IS_WORKER) throw Error('You can\'t start a worker within a worker');
  // create worker from path
  if (typeof worker === 'string') worker = new Worker(worker);
  worker.addEventListener('message', ({data}) => publish(data.key, data.data));
  workers.push(worker);
}

export const subscribe = (key, fn) => {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(fn);
}

export const publish = (key, data) => {
  if (subscribers[key])
    subscribers[key].forEach(fn => fn(data));

  if (IS_WORKER)
    self.postMessage({key, data});
  else
    workers.forEach(worker => worker.postMessage({key, data}));
}
