var precache = 'precache1';
var cacheName = 'appCache';
//var dbPromise = idb.open('test-db', 1, function(upgradeDb){
  //if(!upgradeDb.objectStoreNames.contains('firstOS')){
    //upgradeDb.createObjectStore('firstOS');
  //}
//});

var AppShell =[
  'index.html',
  'css/styles.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(precache)
    .then(cache => cache.addAll(AppShell))
    .then(self.skipWaiting())
  );
});

self.addEventListener('activate',(event)=>{
 console.log('activated serviceWorker');
 const currentCaches = [precache,cacheName];
 event.waitUntil(
   caches.keys().then(cacheNames =>{
     return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
   }).then(cachesToDelete => {
     return Promise.all(cachesToDelete.map(cacheToDelete =>{
       return caches.delete(cacheToDelete);
     }));
   }).then(()=> self.clients.claim())
 );
});

 self.addEventListener('fetch', function(event){
   var storageUrl = event.request.url.split(/[?#]/)[0];

   if(storageUrl.startsWith(self.location.origin)){
     event.respondWith(
       caches.match(storageUrl).then(cachedResponse =>{
         if (cachedResponse){
           return cachedResponse;
         }
         return caches.open(cacheName).then(cache =>{
           return fetch(event.request).then(response =>{
             return cache.put(storageUrl, response.clone()).then(()=>{
           return response;
         });
       });
     });
       })
     );
   }
   });
