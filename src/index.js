import '@babel/polyfill';

document.getElementById('notification').style.display = 'none';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').then(function (registration) {
    // Registration was successful
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function(err) {
    // registration failed :(
    console.log('ServiceWorker registration failed: ', err);
  });

  navigator.serviceWorker.addEventListener('message', function (event) {
    console.log("Got reply from service worker: " + event.data);
    if (event.data === 'version.update') {
      document.getElementById('notification').style.display = 'block';
    }
  });
}

// async function init () {
//   setInterval(async () => {
//     const response = await fetch('./version.json');
//     const {version: newVersion} = await response.json();
//   }, 1000);
// }

// init();
