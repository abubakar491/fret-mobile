import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import BackgroundGeolocation, { ConnectivityChangeEvent, GeofenceEvent, HttpEvent, MotionActivityEvent, MotionChangeEvent } from "@transistorsoft/capacitor-background-geolocation";
import { DriverService } from '../../core/services/driver.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class LocationTrackerProvider {

  private currentUser: any;
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public webAPIWatcherID: any;
  public lastGeolocationTime: any;


  constructor(
    public platform: Platform,
    public http: HttpClient,
    private driverService: DriverService
  ) {
    console.log('Hello LocationTrackerProvider Provider capacitor');
    platform.ready().then(() => {
      console.log('LocationTrackerProvider - Platform is ready');
      if (platform.is('capacitor')) {
        console.log('Setting configureBackgroundGeolocation');
        this.configureBackgroundGeolocation.bind(this);
        this.configureBackgroundGeolocation();
      }
    });
  }

  configureBackgroundGeolocation(user_id = '') {
    console.log('Inside configureBackgroundGeolocation');
    console.log('currentUser in geoloc', this.currentUser);
    let access_token = '';
    setTimeout(() => {

      let userData = this.driverService.getDriver();
      console.log('onToggleEnabled userData', userData);
      if (userData) {
        this.currentUser = userData;

        access_token = JSON.parse(this.currentUser.token).access_token;
        console.log(access_token, this.currentUser);
      }

      //this.currentUser = (user_id !== '') ? user_id : (this.currentUser | 0);
      // 1. Listen to events (see the docs a list of all available events)
      BackgroundGeolocation.onLocation(this.onLocation.bind(this));
      BackgroundGeolocation.onMotionChange(this.onMotionChange.bind(this));
      BackgroundGeolocation.onActivityChange(this.onActivityChange.bind(this));
      BackgroundGeolocation.onGeofence(this.onGeofence.bind(this));
      BackgroundGeolocation.onHttp(this.onHttp.bind(this));
      BackgroundGeolocation.onEnabledChange(this.onEnabledChange.bind(this));
      BackgroundGeolocation.onConnectivityChange(this.onConnectivityChange.bind(this));

      // 2. Configure the plugin


      BackgroundGeolocation.ready({
        locationAuthorizationRequest: 'Always',
        backgroundPermissionRationale: {
          title: "Allow {applicationName} to access to this device's location in the background?",
          message: "In order to track your activity in the background, please enable {backgroundPermissionOptionLabel} location permission",
          positiveAction: "Change to {backgroundPermissionOptionLabel}",
          negativeAction: "Cancel"
        },
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        // distanceFilter: 10,
        locationUpdateInterval: 60000 * 1, // 60000 * minutes
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        url: environment.apiURL + environment.user.locations, //  + '?user_id' + this.currentUser,
        autoSync: true,
        params: {
          user_id: this.currentUser
        },
        headers: {
          'Authorization': 'Bearer ' + access_token
        },
        stationaryRadius: 1,
        foregroundService: true
      }).then((state) => {
        console.log('[ready] state', state);
        // Note:  the SDK persists its own state -- it will auto-start itself after being terminated
        // in the enabled-state when configured with stopOnTerminate: false.
        // - The #onEnabledChange event has fired.
        // - The #onConnectivityChange event has fired.
        // - The #onProviderChange has fired (so you can learn the current state of location-services).

        if (!state.enabled) {
          // 3. Start the plugin.  In practice, you won't actually be starting the plugin in the #ready callback
          // like this.  More likely, you'll respond to some app or UI which event triggers tracking.  "Starting an order"
          // or "beginning a workout", for example.
          if (this.currentUser) {
            BackgroundGeolocation.start();
          }
        } else {
          // If configured with stopOnTerminate: false, the plugin has already begun tracking now.
          // - The #onMotionChange location has been requested.  It will be arriving some time in the near future.
        }
      }).catch(error => {
        console.log("- BackgroundGeolocation error: ", error);
      });

    }, 3000);
  }

  onLocation(location: Location) {
    console.log('[location] -', location);
  }
  onMotionChange(event: MotionChangeEvent) {
    console.log('[motionchange] -', event.isMoving, event.location);
  }
  onActivityChange(event: MotionActivityEvent) {
    console.log('[activitychange] -', event.activity, event.confidence);
  }
  onGeofence(event: GeofenceEvent) {
    console.log('[geofence] -', event.action, event.identifier, event.location);
  }
  onHttp(event: HttpEvent) {
    console.log('[http] -', event.success, event.status, event.responseText);
  }
  onEnabledChange(enabled: boolean) {
    console.log('[enabledchange] - enabled? ', enabled);
  }
  onConnectivityChange(event: ConnectivityChangeEvent) {
    console.log('[connectivitychange] - connected?', event.connected);
  }
  onToggleEnabled(value) {
    // console.log('[BackgroundGeolocation] onToggleEnabled', value, ENV.apiURL + ENV.user.locations);
    let userData = this.driverService.getDriver();
    console.log('onToggleEnabled userData', userData);
    if (userData) {
      this.currentUser = userData;
      let access_token = JSON.parse(this.currentUser.token).access_token;
      // this.bgGeoConfig.params.user_id = this.currentUser;
      if (this.platform.is('capacitor')) {
        BackgroundGeolocation.getState().then((currentState: any) => {
          let config = currentState;
          config['params'] = { user_id: this.currentUser.id };
          config['headers'] = { 'Authorization': 'Bearer ' + access_token };
          console.log('BG GeoConfig', config);
          BackgroundGeolocation.setConfig(config).then((state) => {
            console.log('New State is', state);
            if (value) {
              BackgroundGeolocation.start().then((result: any) => {
                console.log('[toggleEnabled] - State', BackgroundGeolocation.getState());
              });
            }
          });
        });
      }

    }
  }
  sendUserCurrentGeoLocation(status, orderId) {
    console.log('[BackgroundGeolocation] sendUserCurrentGeoLocation');
    let userData = this.driverService.getDriver();
    if (userData) {
      this.currentUser = userData;
      let access_token = JSON.parse(this.currentUser.token).access_token;
      console.log('CurrentUser', this.currentUser);
      BackgroundGeolocation.getState().then((currentState: any) => {
        let config = currentState;
        config['params'] = { user_id: this.currentUser.id };
        config['headers'] = { 'Authorization': 'Bearer ' + access_token };
        console.log('BG GeoConfig', config);
        BackgroundGeolocation.setConfig(config).then((state) => {

          BackgroundGeolocation.start().then((result: any) => {
            console.log('[toggleEnabled] - State', BackgroundGeolocation.getState());
          });
        });
      });
      BackgroundGeolocation.getCurrentPosition({
        timeout: 30,          // 30 second timeout to fetch location
        persist: true,        // Defaults to state.enabled
        maximumAge: 5000,     // Accept the last-known-location if not older than 5000 ms.
        desiredAccuracy: 10,  // Try to fetch a location with an accuracy of `10` meters.
        samples: 3,           // How many location samples to attempt.
        extras: {             // Custom meta-data.
          "user_id": this.currentUser,
          "status": status,
          "orderId": orderId,
        }
      }).then((res) => {
        console.log('[BackgroundGeolocation] sendUserCurrentGeoLocation Result', res);
      }).catch((err) => {
        console.log('[BackgroundGeolocation] sendUserCurrentGeoLocation Error', err);
      })
    }
  }
}
