import './vendor.ts';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import * as Sentry from '@sentry/angular';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

environment.SENTRY_DSN &&
  Sentry.init({
    dsn: environment.SENTRY_DSN,
    environment: environment.SENTRY_ENVIRONMENT,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.4,
  });

if (environment.production) {
  enableProdMode();
}

const p = platformBrowserDynamic().bootstrapModule(AppModule);
p.then(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).appBootstrap && (window as any).appBootstrap();
});
// .catch(err => console.error(err));
