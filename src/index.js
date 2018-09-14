import '@babel/polyfill';

document.getElementById('notification').style.display = 'none';

document.getElementById('reload').addEventListener('click', () => {
  // notify the SW that the user has accepted the new version and hard reload the page.
  sendMessage('update');

  setTimeout(() => {
    window.location.reload(true);
  }, 100);
});

function sendMessage (message) {
  navigator.serviceWorker.controller.postMessage(message);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(registration => {
    // Registration was successful
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(err => {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });

  navigator.serviceWorker.addEventListener('message', event => {
    // display a message to the user when a new version is detected.
    if (event.data === 'version.update') {
      document.getElementById('notification').style.display = 'block';
    }
  });

  // detect if the SW is accessible for postMessage, refresh page if not (potential infinte loop if never resolved?).
  const controlledPromise = new Promise((resolve, reject) => {
    if (navigator.serviceWorker.controller) return resolve();
    navigator.serviceWorker.addEventListener('controllerchange', e => resolve());
    setTimeout(() => reject(), 100);
  });

  controlledPromise.then(() => console.log('controlled')).catch(() => window.location.reload());
}

// setInterval(async () => {
//   const response = await fetch('./version.json');
// }, 1000);
