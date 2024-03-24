import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { environment } from "./../../environments/environment";
import { BaseApiService } from "../core/services/base-api.service";
import { ChatMessage, MessageType } from "../models";

@Injectable({ providedIn: 'root' })
export class DiscussionsService {
  newMessageNotification = new BehaviorSubject<any>({});

  constructor(private baseApiService: BaseApiService) {}

  sendMsg(msg: ChatMessage, files = null) {
    let body = '';
    if (msg.type === MessageType.AUDIO || msg.type === MessageType.PHOTO) {
      body = JSON.stringify(files);
    }

    return this.baseApiService.post(
      environment.discussions.sendMessage,
      body,
      { order_id: msg.orderId, message: msg.message, type: msg.type }
    );
  }

  getDiscussions() {
    return this.baseApiService.get(environment.discussions.discussions)
  }

  getMsgList(order_id) {
    return this.baseApiService.get(environment.discussions.getMessages, { order_id });
  }

  markDiscussionAsRead(order_id): Promise<any> {
    return this.baseApiService.post(environment.discussions.markAsRead, '', { order_id }).toPromise();
  }
}
