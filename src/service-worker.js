import '@babel/polyfill';
import { set, get } from 'idb-keyval'

// const cacheName = 'version';

// self.addEventListener('install', async event => {
//   event.waitUntil(
//     caches.open(cacheName)
//       .then(cache => cache.addAll([
//         './version.json'
//       ]))
//   );
// });

// self.addEventListener('activate', event => {
// });

// self.addEventListener('fetch', async event => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(async response => {
//         const match = event.request.url.match(/version.json$/);

//         if (match && response) {
//           let existingVersion;

//           if (response.body) {
//             const {value} = await response.body.getReader().read();
//             const data = String.fromCharCode.apply(null, value);
//             existingVersion = JSON.parse(data).version;
//           } else {
//             console.log(Object.keys(response));
//             // console.log(response);
//             existingVersion = 'no body...';
//           }

//           const newResponse = await fetch(event.request.url);
//           const {version: newVersion} = await newResponse.json();

//           console.log(existingVersion, newVersion);

//           if (existingVersion !== newVersion) {
//             sendMessage('version.update');
//           }
//         }
//         if (!match && response) {
//           return response;
//         }

//         const cache = await caches.open(cacheName);

//         return fetch(event.request).then(response => {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       })
//   );
// });




function sendMessage (message) {
  self.clients.matchAll({includeUncontrolled: true, type: 'window'}).then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    })
  });
}




self.addEventListener('install', async event => {
  const response = await fetch('./version.json');
  const {version} = await response.json();
  await set('version', version);
});

self.addEventListener('fetch', async event => {
  initVersionPoll();
});

self.addEventListener('activate', event => {
  initVersionPoll();
});

let init = true;
function initVersionPoll () {
  if (!init) return;

  init = false;

  setInterval(async () => {
    const response = await fetch('./version.json');
    const {version: newVersion} = await response.json();
    const version = await get('version');

    if (newVersion !== version) {
      console.log(newVersion);
      await set('version', newVersion);
      sendMessage('version.update');
    }
  }, 1000);
}
