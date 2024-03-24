import { Injectable } from "@angular/core";
import { Media, MediaObject, MEDIA_STATUS } from '@awesome-cordova-plugins/media/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileTransfer, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { from, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class MediaService {
  filePath: string;
  audio: MediaObject;

  constructor(
    private platform: Platform,
    private transfer: FileTransfer,
    private file: File,
    private media: Media
  ) { }

  /**
   *
   */
  async takePicture() {
    if (this.platform.is('capacitor')) {
      const image = await Camera.getPhoto({
        quality: 20,
        source: CameraSource.Prompt,
        resultType: CameraResultType.Base64,
        saveToGallery: true
      }).catch(
        (err) => {
          console.log('canceld');
        }
      );
      return image;
    } else { // CameraSource.Camera for debug in the browser
      const image = await Camera.getPhoto({
        quality: 20,
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
        saveToGallery: true
      }).catch(
        (err) => {
          console.log('canceld');
        }
      );
      return image;
    }
  }

  playAudio(file) {
    let fn = 'file://';
    const filename = file.substring(file.lastIndexOf('/') + 1);
    this.filePath = file;
    if (this.platform.is('ios')) {
      fn += this.file.documentsDirectory.replace(/file:\/\//g, '');
    } else if (this.platform.is('capacitor')) {
      fn += this.file.externalDataDirectory.replace(/file:\/\//g, '');
    }

    this.file.checkFile(fn, filename).then((found: boolean) => {
      if (found) {
        this.filePath = fn + filename;
      } else {
        this.filePath = file;
        this.download(file).then(() => { });
      }
    }).catch(() => {
      this.filePath = file;
      this.download(file).then(() => { });
    });

    this.audio = this.media.create(this.filePath);
    this.audio.play();
    this.audio.setVolume(0.8);
    return this.audio.onStatusUpdate;
  }

  download(url: string) {
    let ft: FileTransferObject = this.transfer.create();
    let fn = '';
    if (this.platform.is('ios')) {
      fn = this.file.documentsDirectory.replace(/file:\/\//g, '') + url.substring(url.lastIndexOf('/') + 1);
    } else if (this.platform.is('capacitor')) {
      fn = this.file.externalDataDirectory.replace(/file:\/\//g, '') + url.substring(url.lastIndexOf('/') + 1);
    }
    return ft.download(url, fn, true);
  }

  getAudioDuration() {
    return this.audio.getDuration();
  }

  getCurrentPosition() {
    return this.audio.getCurrentPosition();
  }

  pauseAudio() {
    this.audio.pause();
  }
}
