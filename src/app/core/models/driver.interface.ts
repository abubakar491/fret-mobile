export interface Driver {
  readonly id: string;
  readonly uuid: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  roles: Array<any>;
  client: Client;
  demo_warning: boolean;
  token: string;
  [key: string]: any;
}

interface Client {
  readonly id: string;
  readonly uuid: string;
  name: string;
  type: string;
  acronyme: string;
  address: string;
  url_import: string;
  vrp: boolean;
  live_optim: boolean;
  average_speed: boolean;
  minVehicles: boolean;
  balance: boolean;
  minVisitsPerVehicle: number;
  maxVisitsPerVehicle: number;
  squashDurations: number;
  maxVisitLateness: number;
  minDistance: boolean;
  maxTravelTime: number;
  round_up_pallets: boolean;
  currency: string;
  [key: string]: any;
  forcePOD: boolean;
}
