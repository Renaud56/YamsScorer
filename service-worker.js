const CACHE_NAME='yams-scorer-shell-v2';
const APP_URL=new URL('./',self.registration.scope).href;
const APP_SHELL=[
	APP_URL,
	new URL('./manifest.webmanifest',self.registration.scope).href,
	new URL('./icons/yams.svg',self.registration.scope).href
];

self.addEventListener('install',event =>
{
	event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate',event =>
{
	event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('yams-scorer-shell-')&&key!==CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch',event =>
{
	const request=event.request,url=new URL(request.url);
	if(request.method!=='GET'||url.origin!==self.location.origin) return;
	if(request.mode==='navigate')
	{
		event.respondWith(fetch(request).then(response =>
		{
			if(response.ok) caches.open(CACHE_NAME).then(cache => cache.put(APP_URL,response.clone()));
			return response;
		}).catch(async () => await caches.match(request)||await caches.match(APP_URL)));
		return;
	}
	event.respondWith(caches.match(request).then(response => response||fetch(request)));
});