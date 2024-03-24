/**
 * Most of the code in this file is copied from the old application.
 */
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

import { OrderService } from './services/order.service';

@Component({
  selector: 'freterium-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  tasksTimer : any = null;

  constructor(private platform: Platform, private orderService: OrderService) {
    this.platform.ready().then(() => {
      this.handleTasks();

      platform.resume.subscribe ( (e) => {
        localStorage.setItem('bg_tasks_ongoing', "false");
        this.handleTasks();
      });
    });
  }

  private handleTasks(enable = true): void {
    if (enable) {
      this.tasksTimer = setInterval(() => {
        let tasks = localStorage.getItem('bg_tasks');
        if (tasks) {
          tasks = JSON.parse(tasks);
          this.executeTasks(tasks);
        }
      }, 2000);
    } else {
      clearInterval(this.tasksTimer);
    }
  }

  executeTasks(tasks) {
    let tasks_ongoing = localStorage.getItem('bg_tasks_ongoing');
    tasks_ongoing = (tasks_ongoing) ? JSON.parse(tasks_ongoing) : false;
    if (tasks.length && !tasks_ongoing) {
      localStorage.setItem('bg_tasks_ongoing', "true");
      const tasks_length = tasks.length;
      let tasks_passed = 0;

      for (let i = tasks_length - 1; i >= 0; i--) {
        const task = tasks[i];
        if (typeof task.order_id !== 'undefined' && task.order_id) {
          // Send POD files
          this.orderService.sendPOD(task.order_id, task.data, false, task.type, task.relatedOrderIds).then((result: any) => {
            tasks_passed++;
            if (result && result.code && result.code === 200) {
              // Remove from tasks list
              tasks.splice(i, 1);
            }
            if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
              // Update Local Storage
              localStorage.setItem('bg_tasks', JSON.stringify(tasks));
              localStorage.setItem('bg_tasks_ongoing', "false");
            }
          }).catch((err: any) => {
            tasks_passed++;
            if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
              // Update Local Storage
              localStorage.setItem('bg_tasks', JSON.stringify(tasks));
              localStorage.setItem('bg_tasks_ongoing', "false");
            }
          });
        } else {
          tasks_passed++;
          if (tasks_passed === tasks_length) { // To make sure all tasks have been processed
            // Update Local Storage
            localStorage.setItem('bg_tasks', JSON.stringify(tasks));
            localStorage.setItem('bg_tasks_ongoing', "false");
          }
        }
      }
    }
  }
}
