import { environment } from './../../environments/environment';
import { STATUS, STATUS_ICONS, STATUS_TEXTS } from './../constants/global.constant'
import * as moment from 'moment';
import { Location } from './location.class';

export class Order {
  id: string;
  shipper: string;
  ref: string;
  created: string;
  assigned: boolean;
  status: number;
  from: Location;
  to: Location;
  order_details: OrderDetails;
  drivers: any[];
  vehicle: Vehicle;
  comment: string;
  files: any[];
  status_details: StatusDetails;
  difficulties: any[];
  driverPath: any[];
  orderItems: any[];
  pod: any;
  loading_started: string;
  delivery_started: string;
  unreadMsgs: number;
  durations: {
    global: number,
    global_text: string,
    loading_location: number,
    loading_location_text: string,
    unloading_location: number,
    unloading_location_text: string
  };
  distances: {
    global: number,
    global_text: string,
    loading_location: number,
    loading_location_text: string,
    unloading_location: number,
    unloading_location_text: string
  };

  sort_date: string;

  order_price: {
    value: number,
    unit: string,
    status: boolean,
    last_user: number,
    last_clientid: number
  };

  route: OrderRoute;
  state: any;
  total_cod: number;
  tracking_number: string;
  tracking_provider: string;
  units: number;
  units_value: number;
  payment_mode: number;
  cargoPayment: any;
  STATUS_TEXT: string;
  OTP: number;
  use_otp: boolean;
  otp_closing_requested: boolean;
  uuid: string;
  scheduled_sequence_number: number;

  constructor(order_data) {
    if (order_data && order_data.id) {
      this.id = order_data.id;
      this.ref = order_data.reference;
      this.status = order_data.status;
      this.created = order_data.created;
      this.assigned = false;
      this.comment = order_data.comment;
      this.files = [];
      // this.status_details = new StatusDetails(order_data.detail_status);
      this.difficulties = [];
      this.driverPath = [];
      this.orderItems = [];
      this.pod = {};
      this.loading_started = '';
      this.delivery_started = '';
      this.unreadMsgs = -2;
      this.route = new OrderRoute();
      this.scheduled_sequence_number = order_data.scheduled_sequence_number;

      // Unread Messages
      if (typeof order_data.discussion_number !== 'undefined') {
        this.unreadMsgs = order_data.discussion_number;
      }

      // Shipper
      this.shipper = order_data.loader_name || ''; // 'Freterium';

      // Files
      if (typeof order_data.files !== 'undefined' && order_data.files.length) {
        order_data.files.forEach(file => {
          file.path = environment.uploads + file.path;
          this.files.push(file);
        });
      }

      // Driver
      this.drivers = order_data.drivers;

      // Vehicle
      this.vehicle = new Vehicle();
      if (typeof order_data.vehicle !== 'undefined') {
        this.vehicle.name = order_data.vehicle.name;
        this.vehicle.id = order_data.vehicle.id;
        this.vehicle.registration_number = order_data.vehicle.matricule;
        this.vehicle.brand = order_data.vehicle.brand;
        this.vehicle.model = order_data.vehicle.model;
      }

      // Order Details
      let hasDetails = false;
      let total = 0;
      this.order_details = new OrderDetails();
      if (typeof order_data.load_detail !== 'undefined') {
        if (typeof order_data.load_detail.pallets !== 'undefined' && order_data.load_detail.pallets.length) {
          order_data.load_detail.pallets.forEach(element => {
            total += element.quantity;
            this.order_details.data.pallets.push(element);
          });
          hasDetails = (total > 0);
          this.order_details.short_description += (hasDetails) ? total + ' Palettes' : '';
          this.order_details.type = 'indetail';
        }
        if (typeof order_data.load_detail.outsizes !== 'undefined' && order_data.load_detail.outsizes.length) {
          total = 0;
          order_data.load_detail.outsizes.forEach(element => {
            total += element.quantity;
            this.order_details.data.outsizes.push(element);
          });
          this.order_details.short_description += (hasDetails) ? ',' : '';
          this.order_details.short_description += (total) ? total + ' Hors Gabarit' : '';
          this.order_details.type = 'indetail';
        }
        if (typeof order_data.load_detail.entire_truck !== 'undefined' && typeof order_data.load_detail.entire_truck.weight !== 'undefined') {
          this.order_details.data.truck_weight = order_data.load_detail.entire_truck.weight;
          this.order_details.type = 'full';
          this.order_details.short_description = 'Camion Complet (' + this.order_details.data.truck_weight + ' Kg)';
        }
        this.order_details.vehicle_type = order_data.vehicle_type;
        this.order_details.nature = order_data.load_type;
      }

      // Loading Details
      this.from = new Location();
      if (typeof order_data.infos_loading !== 'undefined') {
        if (typeof order_data.infos_loading.location !== 'undefined') {
          this.from.id = order_data.infos_loading.location.id || '';
          this.from.name = order_data.infos_loading.location.name;
          this.from.address = order_data.infos_loading.location.address;
          this.from.address_additional = order_data.infos_loading.location.address_more;
          this.from.loading_mode = order_data.infos_loading.location.loading_mode;
          this.from.unloading_mode = '';
          this.from.instructions = order_data.infos_loading.location.instructions;
          this.from.geo.lat = order_data.infos_loading.location.geo.lat;
          this.from.geo.lng = order_data.infos_loading.location.geo.lng;
          this.from.geo.radius = order_data.infos_loading.location.geo.rayon;
          this.from.timeslot.starts = order_data.infos_loading.location.time_start || '';
          this.from.timeslot.ends = order_data.infos_loading.location.time_end || '';
          this.from.contact.name = order_data.infos_loading.location.contact || '';
          this.from.contact.phone = order_data.infos_loading.location.phone_fixed || '';
          this.from.contact.phone_2 = order_data.infos_loading.location.phone_mobile || '';
          this.from.has_docks = order_data.infos_loading.location.has_docks;
        }
      }
      if (typeof order_data.loading_started !== 'undefined') {
        this.loading_started = order_data.loading_started;
      } else {
        // this.loading_started = '2019-01-30 11:00:10';
      }

      // Unloading Details
      this.to = new Location();
      if (typeof order_data.infos_delivery !== 'undefined') {
        if (typeof order_data.infos_delivery.location !== 'undefined') {
          this.to.id = order_data.infos_delivery.location.id || '';
          this.to.name = order_data.infos_delivery.location.name;
          this.to.address = order_data.infos_delivery.location.address;
          this.to.address_additional = order_data.infos_delivery.location.address_more;
          this.to.loading_mode = order_data.infos_delivery.location.loading_mode;
          this.to.unloading_mode = '';
          this.to.instructions = order_data.infos_delivery.location.instructions;
          this.to.geo.lat = order_data.infos_delivery.location.geo.lat;
          this.to.geo.lng = order_data.infos_delivery.location.geo.lng;
          this.to.geo.radius = order_data.infos_delivery.location.geo.rayon;
          this.to.timeslot.starts = order_data.infos_delivery.location.time_start || '';
          this.to.timeslot.ends = order_data.infos_delivery.location.time_end || '';
          this.to.contact.name = order_data.infos_delivery.location.contact || '';
          this.to.contact.phone = order_data.infos_delivery.location.phone_fixed || '';
          this.to.contact.phone_2 = order_data.infos_delivery.location.phone_mobile || '';
          this.to.has_docks = order_data.infos_delivery.location.has_docks;
        }
      }
      if (typeof order_data.delivery_started !== 'undefined') {
        this.delivery_started = order_data.delivery_started;
      } else {
        // this.delivery_started = '2019-01-30 11:00:10';
      }

      // Status Details
      if (typeof order_data.detail_status !== 'undefined') {
        // this.status_details = order_data.status_details;
        this.status_details = new StatusDetails(order_data.detail_status);
      }
      // Difficulties
      if (typeof order_data.difficulties !== 'undefined') {
        this.difficulties = order_data.difficulties;
      }
      // Driver Path
      if (typeof order_data.locations !== 'undefined') {
        this.driverPath = order_data.locations;
        if (this.driverPath.length) {
        }
      }

      if (order_data.order_items) {
        this.orderItems = order_data.order_items;
      }

      // POD
      if (typeof order_data.pod !== 'undefined') {
        this.pod = order_data.pod;
      } else { // To Remove
        this.pod = {
          id: 13,
          created: '2018-11-27 15:23:12',
          updated: null,
          confirmation_date: '',
          status: 1
        };
      }

      this.durations = {
        global: 0,
        global_text: '',
        loading_location: 0,
        loading_location_text: '',
        unloading_location: 0,
        unloading_location_text: ''
      };
      this.distances = {
        global: 0,
        global_text: '',
        loading_location: 0,
        loading_location_text: '',
        unloading_location: 0,
        unloading_location_text: ''
      };

      // Set Sort Date
      this.sort_date = (this.status < 3) ? moment(this.from.timeslot.starts).format('YYYY-MM-DD') : moment(this.to.timeslot.starts).format('YYYY-MM-DD');

      // Set Order price
      if (typeof order_data.detail_prix !== 'undefined') {
        this.order_price = {
          value: order_data.detail_prix.prix || null,
          unit: order_data.detail_prix.unite_prix || null,
          status: order_data.detail_prix.status_prix || null,
          last_user: order_data.detail_prix.last_user || null,
          last_clientid: order_data.detail_prix.last_clientid || null
        };
      } else {
        this.order_price = {
          value: null,
          unit: null,
          status: null,
          last_user: null,
          last_clientid: null
        };
      }

      // Route
      if (order_data.route) {
        this.route = new OrderRoute(order_data.route);
      }

      this.state = (typeof order_data.state !== 'undefined') ? order_data.state : null;

      this.total_cod = order_data.total_cod;
      this.tracking_number = order_data.tracking_number;
      this.tracking_provider = order_data.tracking_provider;
      this.units = order_data.units || 1;
      this.units_value = order_data.units_value;
      this.payment_mode = order_data.payment_mode;
      this.cargoPayment = order_data.cargoPayment;
      this.OTP = order_data.OTP;
      this.use_otp = order_data.use_otp;
      this.otp_closing_requested = order_data.otp_closing_requested;
      this.uuid = order_data.uuid;
      if (order_data.uuid) {
        this.uuid = order_data.uuid;
      } else if (order_data.key) {
        this.uuid = order_data.key;
      }
    }
  }

  computeTotals(directionServiceResult, cat = 'global') {
    switch (cat) {
      case 'global': {
        this.durations.global = directionServiceResult.routes[0].legs[0].duration.value + Math.round((directionServiceResult.routes[0].legs[0].duration.value * 30) / 100);
        this.durations.global_text = directionServiceResult.routes[0].legs[0].duration.text;
        this.distances.global = directionServiceResult.routes[0].legs[0].distance.value;
        this.distances.global_text = directionServiceResult.routes[0].legs[0].distance.text;
        break;
      }
      case 'loading_location': {
        this.durations.loading_location = directionServiceResult.routes[0].legs[0].duration.value + Math.round((directionServiceResult.routes[0].legs[0].duration.value * 30) / 100);
        this.durations.loading_location_text = directionServiceResult.routes[0].legs[0].duration.text;
        this.distances.loading_location = directionServiceResult.routes[0].legs[0].distance.value;
        this.distances.loading_location_text = directionServiceResult.routes[0].legs[0].distance.text;
        break;
      }
      case 'unloading_location': {
        this.durations.unloading_location = directionServiceResult.routes[0].legs[0].duration.value + Math.round((directionServiceResult.routes[0].legs[0].duration.value * 30) / 100);
        this.durations.unloading_location_text = directionServiceResult.routes[0].legs[0].duration.text;
        this.distances.unloading_location = directionServiceResult.routes[0].legs[0].distance.value;
        this.distances.unloading_location_text = directionServiceResult.routes[0].legs[0].distance.text;
        break;
      }
      default: break;
    }
  }

  update(order, forced = false) {
    if (typeof order !== 'undefined' && typeof order.id !== 'undefined' && ((!forced && order.id === this.id) || forced)) {
      this.id = order.id;
      this.ref = order.ref;
      this.status = order.status;
      this.created = order.created;
      this.assigned = order.assigned;
      this.comment = order.comment;
      this.driverPath = order.driverPath;
      this.shipper = order.shipper;
      this.drivers = order.drivers;
      this.vehicle = order.vehicle;
      this.order_details = order.order_details;
      this.from = order.from;
      this.to = order.to;
      this.status_details = order.status_details;
      this.difficulties = order.difficulties;
      this.files = order.files;
      this.driverPath = order.driverPath;
      this.pod = order.pod;
      this.loading_started = order.loading_started;
      this.delivery_started = order.delivery_started;
      this.durations = order.durations;
      this.distances = order.distances;
      this.sort_date = order.sort_date;
      this.order_price = order.order_price;
      this.unreadMsgs = order.discussion_number;
      // this.route = order.route;
      this.state = order.state;
      this.total_cod = order.total_cod;
      this.tracking_number = order.tracking_number;
      this.tracking_provider = order.tracking_provider;
      this.units = order.units || 1;
      this.units_value = order.units_value;
      this.payment_mode = order.payment_mode;
      this.cargoPayment = order.cargoPayment;
      this.OTP = order.OTP;
      this.use_otp = order.use_otp;
      this.otp_closing_requested = order.otp_closing_requested;
      if (order.uuid) {
        this.uuid = order.uuid;
      } else if (order.key) {
        this.uuid = order.key;
      }

    }
  }

  setOrderTexts() {
    if (this.status === STATUS.ONSITE_LOADING) {
      if (this.from.has_docks) {
        if (this.loading_started === '') {
          this['STATUS_ICON'] = STATUS_ICONS[this.status];
          this['STATUS_TEXT'] = STATUS_TEXTS[3].text;
          this['STATUS_QUESTION'] = STATUS_TEXTS[3].question;
          this['NEXT_STATUS'] = 'ONSITE_LOADING_STARTED';
        } else {
          this['STATUS_ICON'] = STATUS_ICONS['ONSITE_LOADING_STARTED'];
          this['STATUS_TEXT'] = STATUS_TEXTS['ONSITE_LOADING_STARTED'].text;
          this['STATUS_QUESTION'] = STATUS_TEXTS['ONSITE_LOADING_STARTED'].question;
          this['NEXT_STATUS'] = (this.status < STATUS.DELIVERED) ? this.status + 1 : STATUS.DELIVERED;
        }
      } else {
        this['STATUS_ICON'] = STATUS_ICONS[this.status];
        this['STATUS_TEXT'] = STATUS_TEXTS[this.status].text;
        this['STATUS_QUESTION'] = 'ORDERS_ONSITE_LOADING_STARTED_QUESTION';
        this['NEXT_STATUS'] = (this.status < STATUS.DELIVERED) ? this.status + 1 : STATUS.DELIVERED;
      }
    } else if (this.status === STATUS.ONSITE_DELIVERY) {
      if (this.to.has_docks) {
        if (this.delivery_started === '') {
          this['STATUS_ICON'] = STATUS_ICONS[this.status];
          this['STATUS_TEXT'] = STATUS_TEXTS[6].text;
          this['STATUS_QUESTION'] = STATUS_TEXTS[6].question;
          this['NEXT_STATUS'] = 'ONSITE_DELIVERY_STARTED';
        } else {
          this['STATUS_ICON'] = STATUS_ICONS['ONSITE_DELIVERY_STARTED'];
          this['STATUS_TEXT'] = STATUS_TEXTS['ONSITE_DELIVERY_STARTED'].text;
          this['STATUS_QUESTION'] = STATUS_TEXTS['ONSITE_DELIVERY_STARTED'].question;
          this['NEXT_STATUS'] = (this.status < STATUS.DELIVERED) ? this.status + 1 : STATUS.DELIVERED;
        }
      } else {
        this['STATUS_ICON'] = STATUS_ICONS[this.status];
        this['STATUS_TEXT'] = STATUS_TEXTS[this.status].text;
        this['STATUS_QUESTION'] = 'ORDERS_ONSITE_DELIVERY_STARTED_QUESTION';
        this['NEXT_STATUS'] = (this.status < STATUS.DELIVERED) ? this.status + 1 : STATUS.DELIVERED;
      }
    } else {
      this['STATUS_ICON'] = STATUS_ICONS[this.status];
      this['STATUS_TEXT'] = STATUS_TEXTS[this.status].text;
      this['STATUS_QUESTION'] = STATUS_TEXTS[this.status].question;
      if (this.status < STATUS.DELIVERED) {
        if (this.status !== 41 && this.status !== 71) {
          this['NEXT_STATUS'] = (this.status < STATUS.DELIVERED) ? this.status + 1 : STATUS.DELIVERED;
        }
      }

    }
  }
}

export class Driver {
  id: number;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  constructor() {
    this.fname = '';
    this.lname = '';
    this.email = '';
    this.phone = '';
  }
}

export class Vehicle {
  id: number;
  name: string;
  registration_number: string;
  brand: string;
  model: string;
  constructor() {
    this.name = '';
    this.registration_number = '';
    this.brand = '';
    this.model = '';
  }
}

export class OrderDetails {
  vehicle_type: string;
  nature: string;
  type: string;
  data: any;
  short_description: string;
  constructor() {
    this.vehicle_type = '';
    this.nature = '';
    this.type = 'full';
    this.data = {
      pallets: [],
      outsizes: [],
      truck_weight: 0
    };
    this.short_description = '';
  }
}

export class StatusDetail {
  status: number;
  data: {};
  history: any[];
  difficulties: any[];

  constructor(payload) {
    this.status = payload.status;
    this.data = payload.data;
    this.history = payload.history;
    this.difficulties = payload.difficulties;
  }
}
export class StatusDetails {
  steps: StatusDetail[];

  constructor(steps_details) {
    this.steps = [];
    steps_details.forEach(step => {
      this.steps.push(new StatusDetail(step));
    });
    if (typeof this.steps[1] !== 'undefined') {
      // this.steps[1].data['carrier_name'] = 'FastTransport Inc';
    }
  }
}

export class StepMeta {
  step: number;
  title: string;
  subTitle: string;
  class: string;
  icon: string;
  date: string;
  actions: any[];

  constructor() {
    this.title = '';
    this.subTitle = '';
    this.class = '';
    this.icon = '';
    this.date = '';
    this.actions = [];
  }
}

export class OrderRoute {
  route_id: string;
  route_ref: string;
  user_id: string;
  driver_id: string;
  carrier_id: string;
  created: string;
  orders_id: any[];
  orders: Order[];

  constructor(route?: any) {
    if (route) {
      this.setRoute(route);
      return;
    }
    this.route_ref = '';
    this.user_id = '';
    this.driver_id = '';
    this.carrier_id = '';
    this.created = '';
    this.orders_id = [];
    this.orders = [];
  }

  setRoute(route) {
    this.route_id = route.id || route.route_id || '';
    this.route_ref = route.route_ref || '';
    this.user_id = route.user_id || '';
    this.driver_id = route.driver_id || '';
    this.carrier_id = route.carrier_id || '';
    this.created = route.created || '';
    this.orders_id = route.orders_id || [];
    this.orders = [];
  }
}
