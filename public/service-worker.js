// service-worker.js

// eslint-disable-next-line no-unused-vars
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    // Cache static assets here
});

// eslint-disable-next-line no-unused-vars
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    // Add caching logic for offline support
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
