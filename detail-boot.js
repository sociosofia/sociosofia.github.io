await import('./publication-feed.js');
for(const href of ['structure.css','search-network-v1.css']){const css=document.createElement('link');css.rel='stylesheet';css.href=href;document.head.appendChild(css);}
await import('./detail.js');
