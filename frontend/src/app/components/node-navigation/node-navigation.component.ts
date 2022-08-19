import { Component, ViewChild, ElementRef, OnInit, Input, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { NodeNavigationService } from '../../services/node-navigation/node-navigation.service';
import { Router } from '@angular/router';

import { Vector } from '../../util/vector';
import { NavigationNode, NavigationNodeType } from '../../model/node-navigation.model';
import { NodeNavigationRenderer, AnimationEvent } from './node-navigation.renderer';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-node-navigation',
  templateUrl: './node-navigation.component.html',
  styleUrls: ['./node-navigation.component.scss']
})
export class NodeNavigationComponent implements AfterViewInit, OnDestroy {

  renderer: NodeNavigationRenderer;
  clipPath = '';

  minDistance = -1;

  public get currentNode(): NavigationNode {
    return this.renderer.currentNode;
  }

  public get active(): boolean {
    return this.renderer != null && !this.renderer.isMasking() && this.renderer.isRunning();
  }

  @ViewChild('container') container: ElementRef;
  @ViewChild('nodes') nodesElement: ElementRef;
  private _canvas: ElementRef;
  private _context: CanvasRenderingContext2D;
  @ViewChild('canvas') set canvas(canvas: ElementRef) {
    this._canvas = canvas;
    this._context = canvas.nativeElement.getContext('2d', {
      desynchronized: true
    });
  }
  get canvas(): ElementRef {
    return this._canvas;
  }
  @Input() bubbleFill = '#ffffff';
  @Input() bubbleStroke = '#004466';

  get context(): CanvasRenderingContext2D {
    return this._context;
  }

  get width(): number {
    return this.renderer != null ? this.renderer.width : 0;
  }

  get height(): number {
    return this.renderer != null ? this.renderer.height : 0;
  }

  private destroy$ = new Subject();

  constructor(private navigationService: NodeNavigationService, private router: Router) {}

  ngAfterViewInit() {
    setTimeout(_ => {
      this.renderer = new NodeNavigationRenderer(this.context, this.navigationService);
      if (window.location.hash || window.location.href.split(window.location.host)[1].length > 1) {
        this.renderer.stop();
      } else {
        this.renderer.start();
      }
      this.renderer.value().pipe(takeUntil(this.destroy$)).subscribe(() => this.update());
      this.navigationService.pageOpened().pipe(takeUntil(this.destroy$)).subscribe(node => {
        switch (node.type) {
          case NavigationNodeType.Route:
          case NavigationNodeType.ExternalUrl:
            this.router.navigate([node.route, node.extras]);
        }
      });
      this.renderer.animationEvent().pipe(takeUntil(this.destroy$)).subscribe(event => {
        switch (event) {
          case AnimationEvent.PageRetracted:
            this.router.navigateByUrl('/');
            break;
        }
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.renderer.destroy();
  }

  /**
   * An update hook for the node navigation renderer
   */
  public update() {
    if (this.renderer.hovering) {
      this.container.nativeElement.style.cursor = 'pointer';
    } else {
      this.container.nativeElement.style.cursor = 'default';
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.renderer.width = window.innerWidth * window.devicePixelRatio;
    this.renderer.height = window.innerHeight * window.devicePixelRatio;
  }

  @HostListener('window:mousemove', ['$event'])
  public onMouseMove(event: MouseEvent) {
    this.handlePointerMove(event.pageX, event.pageY);
  }

  @HostListener('document:mouseleave')
  public onMouseLeave() {
    if (this.renderer) {
      this.renderer.mouse = new Vector(Infinity, Infinity);
    }
  }

  @HostListener('window:touchstart', ['$event'])
  public onTouchStart(event: TouchEvent) {
    this.handlePointerMove(event.touches[0].pageX, event.touches[0].pageY);
  }

  @HostListener('window:touchmove', ['$event'])
  public onTouchMove(event: TouchEvent) {
    this.handlePointerMove(event.touches[0].pageX, event.touches[0].pageY);
  }

  @HostListener('window:touchend', ['$event'])
  public onTouchEnd(event: TouchEvent) {
    this.handlePointerMove(Infinity, Infinity);
  }

  @HostListener('window:click')
  public onMouseClick() {
    this.handleClick();
  }

  @HostListener('window:touch')
  public onTouch() {
    this.handleClick();
  }

  /**
   * Handler for component touch move events - needed to call prevent default
   * when overlay is active to disable browser gestures
   * @param event the touch event
   */
  @HostListener('touchmove', ['$event'])
  public onComponentTouchMove(event: TouchEvent) {
    if (this.active) {
      event.preventDefault();
    }
  }

  public retractPage() {
    this.navigationService.closePage();
  }

  /**
   * Handles a mouse or touch move event
   * @param x the x value on the canvas
   * @param y the y value on the canvas
   */
  private handlePointerMove(x: number, y: number) {
    if (this.renderer != null) {
      this.renderer.mouse.x = x * window.devicePixelRatio;
      this.renderer.mouse.y = y * window.devicePixelRatio;
    }
  }

  /**
   * Handles a click or touch event
   */
  private handleClick() {
    if (this.active) {
      if (this.renderer.hovering && this.renderer.clickable()) {
        const clicked = this.renderer.hoveringNode;
        if (clicked.type === NavigationNodeType.Group && this.currentNode === clicked) {
          this.navigationService.navigate(clicked.parent);
        } else {
          this.navigationService.navigate(clicked);
        }
      }
    }
  }
}
