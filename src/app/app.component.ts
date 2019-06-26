import { Component } from '@angular/core';
import CanvasDraw from './canvasdraw.js'
import { ImageSample } from './image.js';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Validation Guys!!';
  canvasComp;
  lineWidth = 8;
  lineColor = '#0da34e';

  ngAfterViewInit() {
    this.update();
  }

  undo() {
    this.canvasComp.undo();
  }

  clear() {
    this.canvasComp.clear();
  }

  save() {
    console.log(this.canvasComp.save());
  }

  update() {
    if (this.canvasComp) {
      this.canvasComp.destroy();
    }
    this.canvasComp = new CanvasDraw({
      background: ImageSample(),
      parentElement: '#wrapper',
      lineColor: this.lineColor,
      lineWidth: this.lineWidth
    });
  }


}
