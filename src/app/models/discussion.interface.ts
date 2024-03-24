export enum MessageType {
  TEXT = 'M',
  EMOTICON = 'E',
  AUDIO = 'A',
  PHOTO = 'P',
  ISSUE = 'I'
}

export class ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  orderId: string;
  message: any;
  status: string;
  type: string;
  time: number | string;
  profile: string;
  company: string;
  file?: string;
}

export interface Discussion {
  readonly id: string;
  reference: string;
  loader_name: string;
  status: number;
  payment_mode: string;
  units_value: number;
  loading_started: string;
  delivery_started: string;
  route: DiscussionRoute;
  files: Array<DiscussionFile>;
  [key: string]: any;
}

interface DiscussionRoute {
  route_id: string;
  route_ref: string;
  status: number;
}

interface DiscussionFile {
  readonly id: number;
  path: string;
  created: string;
}
