import '@babel/polyfill';
import 'universal-fetch';
import { set, get, del } from 'idb-keyval'

// Use cache to check for new version (doesn't work in Firefox - in 'fetch' response.body is non-existant).
const cacheName = 'version';

self.addEventListener('install', async event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => cache.addAll([
        './version.json',
        './index.html'
      ]))
  );
});

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
//             existingVersion = 'no body 33...';
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




self.addEventListener('fetch', async event => {
  event.respondWith(
    caches.match(event.request)
      .then(async response => {
        if (!event.request.url.match(/version.json$/)) {
          if (event.request.url.match(/index.html$/)) return fetch(event.request);
          return response || fetch(event.request);
        }

        const res = await fetch('./version.json');
        const {version: newVersion} = await res.json();
        const version = await get('version');

        console.log(version, newVersion);

        if (newVersion !== version) {
          // keep the new version and notify the main thread that there's a new version.
          await set('new.version', newVersion);

          sendMessage('version.update');
        }

        return fetch(event.request);
      })
  )
});




function sendMessage (message) {
  self.clients.matchAll({includeUncontrolled: true, type: 'window'}).then(clients => {
    clients.forEach(client => {
      client.postMessage(message);
    })
  });
}

self.addEventListener('message', async ({data}) => {
  // user has accepted new version so update in idb.
  if (data === 'update') {
    const version = await get('new.version');

    await set('version', version);
    await del('new.version');
  }
});




// Use idb to store version to check against (works in Chrome, Firefox, Safari).
self.addEventListener('install', async event => {
  event.waitUntil(self.skipWaiting());

  // only store the version on first install.
  const v = await get('version');

  if (!v) {
    const response = await fetch('./version.json');
    const {version} = await response.json();

    await set('version', version);
  }
});

// self.addEventListener('fetch', async event => {
//   initVersionPoll();
// });

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());

  // initVersionPoll();
});

// let pollerInterval = null;

// function initVersionPoll () {
//   if (pollerInterval) return;

//   pollerInterval = setInterval(poller, 1000 * 10);
//   setTimeout(poller, 1000);
// }

// async function poller () {
//   // get the current version from the server then compare with local version.
//   const response = await fetch('./version.json');
//   const {version: newVersion} = await response.json();
//   const version = await get('version');

//   console.log(version, newVersion);

//   if (newVersion !== version) {
//     // keep the new version and notify the main thread that there's a new version.
//     await set('new.version', newVersion);

//     sendMessage('version.update');
//   }
// }