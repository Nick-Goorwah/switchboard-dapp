const fs = require('fs');

const production = './src/environments/environment.prod.ts';
const staging = './src/environments/environment.stg.ts';
const development = './src/environments/environment.dev.ts';

const addSentryDSN = (file: string) => {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log(process.env.SENTRY_DSN);
    const result = data.replace(
      'export const environment = {',
      `export const environment = {
  SENTRY_DSN: ${process.env.SENTRY_DSN},`
    );

    fs.writeFile(file, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  });
};

addSentryDSN(production);
addSentryDSN(staging);
addSentryDSN(development);
