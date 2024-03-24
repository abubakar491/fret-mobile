export class Location {
  id: number;
  name: string;
  address: string;
  address_additional: string;
  complete_address: string;
  loading_mode: string;
  unloading_mode: string;
  instructions: string;
  active: boolean;
  has_docks: boolean;
  geo: {
    lat: number,
    lng: number,
    radius: number,
  };
  timeslot: {
    starts: string,
    ends: string,
  };
  contact: {
    name: string,
    phone: string,
    phone_2: string,
    email: string
  };

  constructor() {
    this.active = false;
    this.has_docks = false;
    this.geo = {
      lat: null,
      lng: null,
      radius: null,
    };
    this.timeslot = {
      starts: null,
      ends: null,
    };
    this.contact = {
      name: null,
      phone: null,
      phone_2: null,
      email: null
    };
  }

  initData(location) {
    if (typeof location !== 'undefined') {
      this.id = location.id;
      this.name = location.name;
      this.address = location.address || '';
      this.address_additional = location.address_more || '';
      this.complete_address = location.address + ((this.address_additional.length) ? ', ' + this.address_additional : '');
      this.loading_mode = location.loading_mode || '';
      this.unloading_mode = '';
      this.instructions = location.instructions || '';
      this.geo.lat = location.lat || ''; // || 33.524034;
      this.geo.lng = location.lng || ''; // || -7.8259174;
      this.geo.radius = location.rayon || 100;
      this.timeslot.starts = location.time_start || '08:30';
      this.timeslot.ends = location.time_end || '19:00';
      this.contact.name = location.contact || '';
      this.contact.phone = location.phone_mobile || '';
      this.contact.phone_2 = location.phone_fixed || '';
      this.contact.email = location.email || '';
      this.has_docks = location.has_docks || false;
    }
  }
}
