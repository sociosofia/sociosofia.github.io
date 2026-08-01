await import('./publication-feed.js');
for(const href of ['structure.css','nucleo-v1.css']){const css=document.createElement('link');css.rel='stylesheet';css.href=href;document.head.appendChild(css);}
await import('./home.js');
