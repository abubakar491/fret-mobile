import { HttpStatusCode } from "@angular/common/http";

export interface Order {
  readonly id: string;
  is_late: boolean;
  expedition: Array<any>;
  lateness_type: number;
  status_text: string;
  key: string;
  reference: string;
  loading_mode: string;
  units_count: number;
  units: number;
  units_weight: number;
  assignment_mode: string;
  completed_date: string;
  state: State;
  created: string;
  owner: Owner;
  shipper: Shipper;
  current_client: CurrentClient;
  drivers: Array<any>;
  vehicule: Vehicule;
  status: OrderStatus;
  min_temp: number;
  max_temp: number;
  last_temp: number;
  detail_status: Array<DetailStatus>;
  difficulties: Array<any>;
  infos_loading: Infos;
  infos_delivery: Infos;
  load_type: string;
  locations: Array<any>;
  pod: Array<any>;
  eta: Array<any>;
  from: From;
  to: To;
  loading_started: string;
  delivery_started: string;
  discussion_number: number;
  route: Route;
  vehicle_type: string;
  vehicle_type_id: string;
  campaign: Array<any>;
  tracking_number: string;
  units_value: number;
  tracking_provider: string;
  priority_order: number;
  order_items: OrderItem;
  payment_mode: string;
  cargoPayment: CargoPayment;
  OTP: number;
  use_otp: boolean;
  otp_closing_requested: boolean;
  [key: string]: any;
}

interface State {
  notLoaded: string;
  returned: string;
  closed: string;
  canceled: string;
}

interface Owner {
  readonly id: string;
  type: string;
  name: string;
  acronyme: string;
}

type Shipper = Owner;

interface CurrentClient extends Owner {
  relation: string;
}

interface Vehicule {
  readonly id: string;
  name: string;
  brand: string;
  model: string;
  matricule: string;
  mobile_app_equiped: string;
  vehicle_type: Array<any>;
  vehicle_weight: string;
  driver_id: string;
  locations: Array<any>;
}

interface DetailStatus {
  status: string;
  data: Array<any>;
  history: DetailStatusHistory;
}

interface DetailStatusHistory {
  user: string;
  created_utc: string;
}

interface From {
  name: string;
  has_docks: boolean;
}

type To = From;

interface Infos {
  location: InfosLocation;
  dock: {};
}

interface InfosLocation {
  readonly id: string;
  name: string;
  address: string;
  loading_mode: string;
  has_docks: boolean;
  priority: boolean;
  default: boolean;
  delivery_time_windows: number;
  opening_hour: string;
  closing_hour: string;
  geo: InfosLocationGeo;
  time_start: string;
  time_end: string;
  zone: Array<any>;
}

interface InfosLocationGeo {
  lat: number;
  lng: number;
  rayon: number;
}

interface Route {
  readonly route_id: string;
  route_ref: string;
  status: number;
  total_quantity: number;
  recommended_size: string;
  rate: number;
  distance: number;
  estimated_cost: number;
  pers_estimated_cost: number;
  vehicle_type: string;
  min_temp: number;
  max_temp: number;
}

interface OrderItem {
  readonly id: string;
  name: string;
  code: string;
  quantity: number;
  product: OrderItemProduct
}

interface OrderItemProduct {
  readonly id: string;
  name: string;
  code: string;
}

interface CargoPayment {
  readonly id: string;
  readonly uuid: string;
}

export interface OrderStatusReference {
  icon?: string;
  text?: string;
  nextStatus?: OrderStatus | string;
}

export enum OrderStatus {
  WAITING,
  CONFIRMED,
  ONWAY_LOADING,
  ONSITE_LOADING,
  LOADED,
  ONWAY_DELIVERY,
  ONSITE_DELIVERY,
  DELIVERED
}

export interface PostOrder {
  code: HttpStatusCode;
  data: Array<Order>;
  errors: Array<any>;
  message: string;
  sucess: PostOrderSuccess;
}

interface PostOrderSuccess {
  data: Array<Order>;
  status: string;
}
