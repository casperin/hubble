const workers = [];
const subscribers = {};
const IS_WORKER = typeof WorkerGlobalScope !== 'undefined'
                  && self instanceof WorkerGlobalScope;

if (IS_WORKER) {
  self.addEventListener('message', ({data}) => {
    data = JSON.parse(data);
    if (subscribers[data.key])
      subscribers[data.key].forEach(fn => fn(data.data));
  });
}

export const addWorker = worker => {
  // create worker from path
  if (typeof worker === 'string') worker = new Worker(worker);
  worker.addEventListener('message', ({data}) => {
    data = JSON.parse(data);
    publish(data.key, data.data)
  }, false);
  workers.push(worker);
}

export const subscribe = (key, fn) => {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(fn);
}

export const publish = (key, data) => {
  const json = JSON.stringify({key, data});
  if (IS_WORKER) self.postMessage(json);
  workers.forEach(worker => worker.postMessage(json));
  if (subscribers[key]) subscribers[key].forEach(fn => fn(data));
}
