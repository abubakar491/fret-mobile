# Freterium Mobile App

This project uses Ionic 6 and Capacitor.

## Development server

Run `npm run start` for a dev server. Navigate to `http://localhost:8101/`.

## Set up Weblate i18n resources

- Required for `npm build(-*)` and `npm start`;
- Go to `https://weblate.tools.freterium.com/accounts/profile/#api`;
- Sign in with your Freterium account (with Google Auth);
- Copy API key and save to `.env` file with following contents:
```
WEBLATE_API_URL=https://weblate.tools.freterium.com/api
WEBLATE_API_KEY=<your personal weblate API key>
```
- Test setup with `npm run download-translations`;
- To skip downloading of weblate resources on every build, set env variable (or save it in `.env` file) `WEBLATE_NO_DOWNLOAD=true`;



## Deployment CI/CD 

- Changing Dockerfile on master or release branches builds and publishes a new builder image to GitLab registry under `freterium/mobile-app/builder:latest`
- Merging to master builds dev
- Creating a tag in the form of vX.Y.Z-staging builds staging app
- Creating a tag in the form of vX.Y.Z builds production app
- Production pipeline has a manual step to publish the apk to DO Spaces and flushes the CDN

#### Generate an android password-protected keystore 

```bash
echo y | keytool -genkeypair -dname "cn=Dev Team, ou=dev@freterium.com, o=Freterium Inc, c=US" -alias freterium_mobile_app -keystore freterium_mobile_app.keystore -keypass {INSERT_PASSWORD_HERE} -storepass {INSERT_PASSWORD_HERE} -validity 20000 -keyalg RSA -keysize 2048
```