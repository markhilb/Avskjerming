import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';

import { CanvasComponent } from '../../components/canvas/canvas.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  @ViewChild('canvas') canvas: CanvasComponent;

  totalWidthL: number;
  totalWidthR: number;
  customer: string;
  orderNumber: string;

  glassType = 'klart';
  transport = 'sendes';
  leftMount = 'wallmount';
  rightMount = 'post';
  globalWidth = 60;
  globalHeight = 60;
  individualWidth = 60;
  individualHeight = 60;
  secondGlassHeight = 20;

  packageList = [];
  totalWeight: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  get blob(): Blob {
    const body = JSON.stringify({
      customer: this.customer,
      orderNumber: this.orderNumber,
      totalWidthL: this.totalWidthL,
      totalWidthR: this.totalWidthR,
      globalWidth: this.globalWidth,
      globalHeight: this.globalHeight,
      individualWidth: this.individualWidth,
      individualHeight: this.individualHeight,
      secondGlassHeight: this.secondGlassHeight,
      leftMount: this.leftMount,
      rightMount: this.rightMount,
      transport: this.transport,
      glassType: this.glassType,
      items: this.canvas.itemsAsJson(),
    });
    return new Blob([body], { type: 'text/plain;charset=utf-8' });
  }

  packageListChanged(event) {
    this.totalWeight = (event.weight / 1000).toFixed(0);
    this.packageList = event.list;
    this.cdr.detectChanges();
  }

  _fileSelected(text: string) {
    try {
      const json = JSON.parse(text);
      Object.entries(json).forEach(([key, val]) => (this[key] = val));
      // TODO: Somehow load saved items
    } catch {}
  }

  fileSelected(files: File[]) {
    if (files.length === 1) {
      const fr = new FileReader();
      fr.onload = () => this._fileSelected(fr.result.toString());
      fr.readAsText(files[0]);
    }
  }

  onExport() {
    // Show header (logo + title)
    const header = document.getElementById('export-header');
    header.style.display = 'flex';

    // Hide all the unnecessary elements
    const hidden = Array.from(
      document.getElementsByClassName('hidden') as HTMLCollectionOf<
        HTMLElement
      >,
    );
    const oldStyles = [];
    hidden.forEach((tag) => {
      oldStyles.push(window.getComputedStyle(tag).display);
      tag.style.display = 'none';
    });

    // Wrap canvas and resize if needed
    this.canvas.toggleWrap();
    const canvas = document.getElementById('canvas');
    // 700 = magic number (approx. width of a4 paper) 🤷
    if (canvas.offsetWidth > 700)
      canvas.style.zoom = (100 / (canvas.offsetWidth / 700)).toFixed(0) + '%';

    window.print();

    // Reset page
    canvas.style.zoom = '100%';
    header.style.display = 'none';
    hidden.forEach((tag, i) => (tag.style.display = oldStyles[i]));
    this.canvas.toggleWrap();
  }

  onSave() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(this.blob);
    a.download = this.orderNumber ?? 'vindskjerming';
    a.click();
  }

  onLoad = () => document.getElementById('fileInput').click();

  onReset = () => this.canvas.clear();

  onUndo = () => this.canvas.undo();

  onAddWallmount = () => this.canvas.addWallmount();

  onAddPost = () => this.canvas.addPost();

  onAddGlass = () => this.canvas.addGlass();

  onAddGlassPolygon = () => this.canvas.addGlass(this.secondGlassHeight);
}
