const worker = new Worker('./web-worker.js');

document.getElementById('notification').style.display = 'none';

worker.addEventListener('message', ({data}) => {
  console.log(`Message from worker: ${data}`);

  switch (data) {
    case 'version.update':
      document.getElementById('notification').style.display = 'block';

      break;

    default:
      console.log('Unknown message from worker.')
  }
});

document.getElementById('reload').addEventListener('click', () => {
  // notify the Worker that the user has accepted the new version and hard reload the page.
  // worker.postMessage('update');

  setTimeout(() => {
    window.location.reload(true);
  }, 100);
});

window.addEventListener('load', () => {
  worker.postMessage('start');
});
