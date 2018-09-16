var cacheName = 'appCache';
//var dbPromise = idb.open('test-db', 1, function(upgradeDb){
  //if(!upgradeDb.objectStoreNames.contains('firstOS')){
    //upgradeDb.createObjectStore('firstOS');
  //}
//});



 self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.open(cacheName).then(function(cache){
      return cache.match(event.request).then(function(response){
        return response || fetch(event.request).then(function(response){
          cache.put(event.request, response.clone());
        });
      });
    })
  );
});
