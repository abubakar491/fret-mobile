const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');

dotenv.config();

if (process.env.WEBLATE_NO_DOWNLOAD === 'true') {
  console.log('weblate: skipping.');
  process.exit(0);
}

const WEBLATE_API_URL = process.env.WEBLATE_API_URL + '/components/freterium/all/translations/';
const AUTH_HEADERS = {
  'headers': {
    'Authorization': 'Token ' + process.env.WEBLATE_API_KEY
  }
};

const errorHandler = (baseMessage) => {
  return (err) => {
    console.error(`weblate: error: ${baseMessage}: ${err.message}`);
    process.exit(1);
  }
}

const log = {
  info: (...args) => {
    console.log(`weblate: info:`, ...args)
  },
  error: (...args) => {
    console.error(`weblate: error:`, ...args)
  }
}

const download = (weblateEntry, weblateDefaultEntry) => {
  const url = weblateEntry.url + 'file/?format=json';
  const destBasePath = path.join('src', 'assets', 'i18n');
  fs.mkdirSync(destBasePath, {
    recursive: true
  });

  const destPath = path.join(destBasePath, weblateEntry.filename);

  const prefix = `downloading ${url} to ${destPath}`;
  log.info(`${prefix}...`);

  const file = fs.createWriteStream(destPath);

  return new Promise((resolve, reject) => {
    const saveFile = (rep) => {
      if (rep.statusCode !== 200) {
        reject(`unexpected HTTP ${rep.statusCode} ${prefix}`)
      } else {
        rep.pipe(file);
        file.on('finish', () => {
          fs.readFile(destPath, 'utf8', (err, data) => {
            if (err) {
              reject(`error reading file: ${err.message}`);
            } else {
              const translations = JSON.parse(data);
              const keys = Object.keys(weblateDefaultEntry);
              let modified = false;
              for (const key of keys) {
                if (translations[key] === '') {
                  translations[key] = weblateDefaultEntry[key] || '';
                  modified = true;
                }
              }
              if (modified) {
                fs.writeFile(destPath, JSON.stringify(translations, null, 2), 'utf8', (err) => {
                  if (err) {
                    reject(`error writing file: ${err.message}`);
                  } else {
                    resolve(`${prefix} completed (modified)`);
                  }
                });
              } else {
                resolve(`${prefix} completed`);
              }
            }
          });
        });
      }
    };
    https.get(url, AUTH_HEADERS, saveFile).on('error', errorHandler(prefix));
  });
};



const processTranslations = async (rep) => {
  if (rep.statusCode !== 200) {
    log.error(`unexpected HTTP ${rep.statusCode} downloading weblate index ${WEBLATE_API_URL}`)
    process.exit(1)
  }
  let data = '';
  rep.on('data', (chunk) => {
    data += chunk;
  }).on('end', async () => {
    let translations = JSON.parse(data).results;
    log.info(`${translations.length} translations found`);

    // Fetch the English translation
    const englishTranslation = await fetchEnglishTranslation();

    // Download the translations
    await Promise.all(translations.map((weblateEntry) => download(weblateEntry, englishTranslation)))

    log.info('done.')
  });
};

const fetchEnglishTranslation = () => {
  const url = `${process.env.WEBLATE_API_URL}/translations/freterium/all/en/file/?format=json`;
  const destBasePath = path.join('src', 'assets', 'i18n');
  fs.mkdirSync(destBasePath, {
    recursive: true
  });

  const destPath = path.join(destBasePath, 'en.json');

  const prefix = `downloading ${url} to ${destPath}`;
  log.info(`${prefix}...`);

  const file = fs.createWriteStream(destPath);

  return new Promise((resolve, reject) => {
    const saveFile = (rep) => {
      if (rep.statusCode !== 200) {
        reject(`unexpected HTTP ${rep.statusCode} ${prefix}`)
      } else {
        rep.pipe(file);
        file.on('finish', () => {
          fs.readFile(destPath, 'utf8', (err, data) => {
            if (err) {
              reject(`error reading file: ${err.message}`);
            } else {
              const translations = JSON.parse(data);
              resolve(translations);
            }
          });
        });
      }
    };
    https.get(url, AUTH_HEADERS, saveFile).on('error', errorHandler(prefix));
  });
};

https.get(WEBLATE_API_URL, AUTH_HEADERS, processTranslations).on('error', errorHandler(`reading ${WEBLATE_API_URL}`));
