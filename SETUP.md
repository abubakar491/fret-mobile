# Freterium Driver's Mobile App

## Overview
This document provides an overview of the setup, build and release instructions for the Freterium Driver's Mobile App. It also covers the Git branching flow, release flow, and how to build and release the application to playstore.

## Tools and Technologies
- Node version 16.9.0
- Ionic, version 7
- Git
- Android Studio (Configure Android Devices in Emulator) (Optional)

## Setup Steps

### Requirements
- Use Node version 16.9.0
- Angular version 14
- Install Ionic version 7 (npm i @ionic/cli -g)
- If you need to run android app in Android Emulator, following are required:
  1. Install Android Studio
  2. Install Capacitor version 4  (npm i @capacitor/cli -g)

### Code Setup
- Clone the Driver Mobile App repository

### Other Dependencies
- Node Modules: To install node modules run `npm install`
- If npm install fails then use this command `npm i --legacy-peer`

### Set up Weblate (Translation Files) i18n resources
- Required for npm build(-*) and npm start
- Go to https://weblate.tools.freterium.com/accounts/profile/#api
- Sign in with your Freterium account (with Google Auth)
- Copy API key and save to .env file with following content
```
WEBLATE_API_URL=https://weblate.tools.freterium.com/api
WEBLATE_API_KEY=<your personal weblate API key>
```

- Test setup with `npm run download-translations`
- To skip downloading of weblate resources on every build, set env variable (or save it in .env file) `WEBLATE_NO_DOWNLOAD=true`

## Serve Project
1. Run `npm run download-translations`
2. To serve the app use the `ionic serve` command
3. Use the configuration flag to run a specific environment. For example:
   - Development Environment: `ionic serve` (*By default, it runs on development)
   - Staging Environment: `ionic serve --configuration=staging`
   - Production Environment: `ionic serve --configuration=production`
4. Go to the browser and enter localhost:8100
5. Select mobile view from developer tools and use a mobile device instead of a responsive view for better experience
6. Login to the app

## Local Build and Run Application in Android Studio Emulator
1. To create the app build locally use the `npm run ci-build-development` command
2. Use the following commands to create a build for a specific environment. For example:
   - Development Environment: `npm run ci-build-development`
   - Staging Environment: `npm run ci-build-staging`
   - Production Environment: `npm run ci-build-production`
3. To run the app locally in android emulator use `ionic cap run android` command
4. If Android Studio and Emulator is setup properly, App will open in Android Studio Emulator

## Build App in Docker
1. Run `docker build . --tag=mobile-app` to build the docker image
2. Run `docker build . --tag=mobile-app` to use docker container's command line
3. Run "npm ci && npm run ci-build-development" inside the docker container to create the development build

## Git Branching Flow
- There are two main branches on git: `master` and `release`
- `Master` branch is the base branch for any new feature development, create a new `feature branch` from the `master branch`
- Do the development work in the `feature branch`
- Merge the `feature branch` into the `master branch`
- Test the app
- Merge the `master branch` into the `release branch`. For release to production `(See the Staging and Production Build and Release Sections)`

## Development Build and Release  Flow
- On merging code to the master branch, a CI/CD pipeline will execute and send the development APK to the `notify-development` Slack channel.
- Download the apk and test the application

## Staging Build and Release Flow
- Merge the `master` into the `release` branch.
- Create a new tag named `x.x.x-staging` for the `release` branch.
- Once the tag is created, it will automatically run a CI/CD pipeline and send the development APK to the `#notify-staging` Slack channel.
- Download the apk and test the application.

## Production Build and Release Flow
- Merge all your code into the `release` branch.
- Create a new tag named `x.x.x` for the `release` branch.
- Once the tag is created, it will automatically run a CI/CD pipeline and send the development APK to the `#notify-production` Slack channel.
- Download the apk and test the application.
- Before releasing, take a go ahead from the Product team that testing has been successfully completed.
- In order to release the application click on the publish stage in the pipeline which will roll out the application to drivers.
- All drivers will be notified that a new version is available, If it's a `patch version`  update driver will have the option to skip the update but if it's a `majo`r or `minor` version update drivers will be forced to update the application.
- Production build can be downloaded from this link.
