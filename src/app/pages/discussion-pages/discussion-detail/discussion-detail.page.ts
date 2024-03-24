import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonContent, IonFooter, PopoverController } from '@ionic/angular';
// import { PhotoViewer } from '@ionic-native/photo-viewer';
import * as moment from 'moment';
import { interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DiscussionsService } from '../../../services/discussions.service';
import { DriverService } from '../../../core/services/driver.service';
import { ChatMessage, MessageType } from '../../../models';
import { ReportProblemComponent } from '../../../components/report-problem/report-problem.component';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'freterium-discussion-detail',
  templateUrl: './discussion-detail.page.html',
  styleUrls: ['./discussion-detail.page.scss'],
})
export class DiscussionDetailPage {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonFooter) footer: IonFooter;
  @ViewChild('chat_input') messageInput: ElementRef;
  _user: any;
  order: any;
  msgList: ChatMessage[] = [];
  editorMsg = '';
  messageTypes = MessageType;
  showEmojiPicker = false;
  showOptions = false;
  messagesIntervalObject: any;
  activeAudioFileID: any = 0;
  activeAudioFileState: number = 0;
  activeAudioDuration = '';
  activeAudioPastTime: number = 0;
  activeAudioCurrentTime = '00:00';
  newMessageNotification: any;
  base64Image = '';
  footer_height = 55;
  footerWithOption_height = 155;
  issues = {
    location_closed: { icon: 'warning' },
    waiting_time_extended: { icon: 'warning' },
    change_destination: { icon: 'warning' },
    other_reason: { icon: 'warning' },
  };
  action: string;

  constructor(
    private renderer: Renderer2,
    private activatedRoute: ActivatedRoute,
    private popoverController: PopoverController,
    private driverService: DriverService,
    private discussionService: DiscussionsService,
    private mediaService: MediaService
  ) {
    moment.locale('fr');
  }

  ionViewWillEnter() {
    this._user = this.driverService.getDriver();
    this.activatedRoute.paramMap
      .pipe(map(() => window.history.state))
      .subscribe((state) => {
        this.order = state.order || {
          id: this.activatedRoute.snapshot.params.orderId,
        };
        this.action = state.action;
      });

    if (this.action === 'issue') {
      this.reportProblemPopover({});
    }

    this.getMsg();
    this.listenToNewMessages();
    this.discussionService.markDiscussionAsRead(this.order.id).then(() => {});

    let hasAlreadyScrolled = 3;
    this.content.ionScrollEnd.subscribe(() => {
      if (
        (this.content as any).contentBottom > this.footer_height - 10 &&
        hasAlreadyScrolled
      ) {
        this.scrollToBottom();
        hasAlreadyScrolled--;
      }
    });
  }

  getMsg() {
    return this.discussionService
      .getMsgList(this.order.id)
      .subscribe((res: any) => {
        this.msgList = [];
        if (res.data !== 'undefined') {
          res.data.forEach((msg) => {
            const msgToPush: ChatMessage = {
              id: msg.id,
              userId: msg.fromID,
              userName: msg.from,
              userAvatar: msg?.from?.[0] + msg?.from?.split?.(' ')?.[1]?.[0],
              orderId: this.order.id,
              message:
                msg?.type === MessageType.ISSUE && msg?.content?.length
                  ? JSON.parse(msg?.content?.trim?.())
                  : msg?.content?.trim?.() || '',
              status: 'success',
              type: msg.type,
              time: msg.date,
              profile: msg.profil,
              company: msg.company,
              file:
                msg.file &&
                (msg.type === MessageType.AUDIO ||
                  msg.type === MessageType.PHOTO)
                  ? msg.file.path
                  : msg.file
                  ? msg.file
                  : '',
            };
            this.msgList.push(msgToPush);
          });
        }
        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);
      });
  }

  listenToNewMessages() {
    this.discussionService.newMessageNotification.subscribe(
      (newMessage: any) => {
        if (
          newMessage &&
          newMessage.mission_id &&
          newMessage.mission_id === this.order.id
        ) {
          this.getMsg();
        }
      }
    );
  }

  showPhoto(url, by = '', on: any = '') {
    if (url.length) {
      let title = by.length ? 'Photo envoyé par ' + by : '';
      title += on.length
        ? title.length
          ? ', le ' + on
          : 'Envoyé le ' + on
        : '';

      // PhotoViewer.show(url, title, { share: true });
    }
  }

  playAudio(id) {
    this.msgList
      .filter((m: ChatMessage) => m.id === id && m.type === MessageType.AUDIO)
      .map((msg: ChatMessage) => {
        if (msg.file) {
          this.mediaService.playAudio(msg.file).subscribe((status: any) => {
            this.activeAudioFileID = id;
            this.activeAudioFileState = status;
            let duration = 0;
            if (duration <= 0 && this.activeAudioFileState === 2) {
              setTimeout(() => {
                duration = this.mediaService.getAudioDuration();
              }, 500);
            }
            let playingAudio = interval(1000).subscribe(() => {
              this.mediaService.getCurrentPosition().then((position: any) => {
                if (duration >= 1) {
                  this.activeAudioPastTime = (position / duration) * 100;
                  this.activeAudioCurrentTime = '' + parseInt(position, 10);
                  this.activeAudioCurrentTime =
                    Math.floor(+this.activeAudioCurrentTime / 60)
                      .toString()
                      .padStart(2, '0') +
                    ':' +
                    Math.floor(+this.activeAudioCurrentTime % 60)
                      .toString()
                      .padStart(2, '0');
                  this.activeAudioDuration = '' + parseInt(duration + '', 10);
                  this.activeAudioDuration =
                    Math.floor(+this.activeAudioDuration / 60)
                      .toString()
                      .padStart(2, '0') +
                    ':' +
                    Math.floor(+this.activeAudioDuration % 60)
                      .toString()
                      .padStart(2, '0');
                }
              });
              if (this.activeAudioFileState === 4) {
                playingAudio.unsubscribe();
              }
            });
          });
        }
      });
  }

  pauseAudio() {
    this.mediaService.pauseAudio();
  }

  async reportProblemPopover(e) {
    const popover = await this.popoverController.create({
      cssClass: `report-problem-container discussion-detail ${this.action}`,
      component: ReportProblemComponent,
      componentProps: { order: this.order },
    });

    await popover.present(e);

    const { data } = await popover.onDidDismiss();

    this.showOptions = false;
    if (data && data.problem && data.problem.type) {
      const issue = this.makeMsg(MessageType.ISSUE, {
        user_id: this._user.id,
        user_fullname: this._user.firstname + ' ' + this._user.lastname,
        avatar: this._user.firstname[0] + this._user.lastname[0],
        order_id: data.orderId,
        content: JSON.stringify(data.problem),
        status: 'pending',
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        user_role: this._user.role,
        user_client: this._user.client,
      });
      this.sendIssue(issue)
        .pipe(take(1))
        .subscribe((res: any) => {
          if (res && res.code === 200) {
            let index = this.getMsgIndexById(issue.id);
            if (index !== -1) {
              this.msgList[index].status = 'success';
              this.msgList[index].id = res.data.id;
              console.log('this.msgList[index]', this.msgList[index]);
            }
          }

          if (data) {
            this.getMsg();
          }
        });
    }
  }

  getMsgIndexById(id: string) {
    return this.msgList.findIndex((e) => e.id === id);
  }

  /**
   * @name makeMsg
   * @param type Message type : M, A, P, E, I
   * @param payload Message content
   * @returns {ChatMessage}
   */
  makeMsg(type = 'M', payload: any): ChatMessage {
    const id = Date.now().toString();
    const msg: ChatMessage = {
      id: id,
      userId:
        typeof payload.user_id !== 'undefined'
          ? payload.user_id
          : this._user.id,
      userName:
        typeof payload.user_fullname !== 'undefined'
          ? payload.user_fullname
          : this._user.firstname + ' ' + this._user.lastname,
      userAvatar:
        typeof payload.avatar !== 'undefined'
          ? payload.avatar
          : this._user.firstname[0] + this._user.lastname[0],
      orderId:
        typeof payload.order_id !== 'undefined'
          ? payload.order_id
          : this.order.id,
      message: typeof payload.content !== 'undefined' ? payload.content : '',
      status:
        typeof payload.status !== 'undefined' ? payload.status : 'pending',
      type: type,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      profile:
        typeof payload.user_role !== 'undefined'
          ? payload.user_role
          : this._user.role,
      company:
        typeof payload.user_client !== 'undefined'
          ? payload.user_client
          : this._user.client,
      file: '',
    };

    return msg;
  }

  sendIssue(issue) {
    this.pushNewMsg(issue);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }

    return this.discussionService.sendMsg(issue, null);
  }

  pushNewMsg(msg: ChatMessage) {
    this.msgList.push(msg);
    this.scrollToBottom();
  }

  adjustTextarea(event: any): void {
    let textarea: any = event.target;
    textarea.style.overflow = 'hidden';
    textarea.style.height = textarea.scrollHeight + 2 + 'px';
    if (this.editorMsg.trim()) {
      this.renderer.setStyle((this.footer as any).el, 'height', 'auto');
      this.renderer.setStyle(
        (this.footer as any).el,
        'min-height',
        this.footer_height + 'px'
      );
    } else {
      this.renderer.setStyle(
        (this.footer as any).el,
        'height',
        this.footer_height + 'px'
      );
    }
  }

  sendMsg() {
    if (!this.editorMsg.trim()) return;

    const newMsg = this.makeMsg(MessageType.TEXT, {
      user_id: this._user.id,
      user_fullname: this._user.firstname + ' ' + this._user.lastname,
      avatar: this._user.firstname[0] + this._user.lastname[0],
      order_id: this.order.id,
      content: this.editorMsg,
      status: 'pending',
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      user_role: this._user.role,
      user_client: this._user.client,
    });

    this.pushNewMsg(newMsg);
    this.editorMsg = '';

    if (!this.showEmojiPicker) {
      this.focus();
    }

    this.discussionService
      .sendMsg(newMsg, null)
      .pipe(take(1))
      .subscribe((res: any) => {
        if (res && res.code === 200) {
          let index = this.getMsgIndexById(newMsg.id);
          if (index !== -1) {
            this.msgList[index].status = 'success';
            this.msgList[index].id = res.data.id;
          }
        }
      });
    setTimeout(() => {
      this.getMsg();
    }, 2000);
  }

  showSendOptions() {
    this.showOptions = !this.showOptions;
    if (!this.showOptions) {
      this.focus();
    } else {
      this.setTextareaScroll();
    }
    if (this.content) {
      this.scrollToBottom();
    }
  }

  focus() {
    if (this.messageInput && this.messageInput.nativeElement) {
      this.messageInput.nativeElement.focus();
    }
  }

  setTextareaScroll() {
    const textarea = this.messageInput.nativeElement;
    textarea.scrollTop = textarea.scrollHeight;
  }

  onFocus() {
    this.showEmojiPicker = false;
    this.showOptions = false;
    if (this.content) {
      this.scrollToBottom();
    }
  }

  takePicture() {
    this.mediaService.takePicture().then((res) => {
      if (res) {
        this.base64Image = `data:image/jpeg;base64,${res.base64String}`;
        this.sendPictureFile(this.base64Image);
      }
    });
  }

  sendPictureFile(file) {
    const id = Date.now().toString();
    const msg: ChatMessage = {
      id: id,
      userId: this._user.id,
      userName: this._user.firstname + ' ' + this._user.lastname,
      userAvatar: this._user.firstname[0] + this._user.lastname[0],
      orderId: this.order.id,
      message: '',
      status: 'pending',
      type: MessageType.PHOTO,
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
      profile: this._user.role,
      company: this._user.client,
      file: '',
    };
    this.discussionService
      .sendMsg(msg, [file])
      .pipe(take(1))
      .subscribe((res: any) => {
        this.showOptions = false;
        this.getMsg();
      });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (typeof this.content !== 'undefined' && this.content !== null) {
        this.content.scrollToBottom(300);
      }
    }, 400);
  }
}
