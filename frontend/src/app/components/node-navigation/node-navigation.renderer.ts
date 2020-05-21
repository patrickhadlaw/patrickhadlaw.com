import {
  ContinuousInterpolator,
  AnimationPeriod,
  LinearInterpolator,
  BezierInterpolator
} from '../../util/animate';
import { Vector, rotatePoint } from '../../util/vector';
import { NavigationNode, NavigationNodeType, NavigationNodeView, NavigationNodeLink, NavigationNodeViewState, Acceleration } from '../../model/node-navigation.model';
import { BezierCurve } from '../../util/bezier';
import { NodeNavigationService } from '../../services/node-navigation/node-navigation.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, first, skip } from 'rxjs/operators';
import { Color } from '../../util/color';

export enum AnimationEvent {
  PageExpanding,
  PageRetracted,
  GroupExpanded,
  GroupRetracted
}

/**
 * The renderer for the node navigation canvas
 */
export class NodeNavigationRenderer extends ContinuousInterpolator {

  readonly GradientStart = 'rgb(0, 153, 230)';
  readonly GradientEnd = 'rgb(92, 0, 230)';

  readonly ExpandPercent = 50;
  readonly ExpandTime = 1000;
  readonly MaximumVelocity = 0.25;

  public nodeViews: NavigationNodeView[] = [];
  public nodeLinks: NavigationNodeLink[] = [];

  public highlighted: NavigationNodeView;
  public highlightTransition: number;

  private _width = 0;
  private _height = 0;
  public mouse = new Vector(Infinity, Infinity);

  private _hovering = false;

  private maskPosition: Vector = new Vector(0, 0);
  private maskRadius = 0;
  private maskOpacity = 1.0;
  private expanding = false;
  private rootRadius = 0;
  private root = new NavigationNode();
  private current = new NavigationNode();

  private event$ = new Subject<AnimationEvent>();
  private destroy$ = new Subject();

  public get width(): number {
    return this._width;
  }

  public set width(width: number) {
    this._width = width;
  }

  public get height(): number {
    return this._height;
  }

  public set height(height: number) {
    this.rootRadius = height / 8;
    this._height = height;
    if (!this.expanding) {
      this.nodeViews.forEach(v => {
        if (v.node === this.currentNode) {
          v.radius = this.rootRadius;
        } else {
          v.radius = this.rootRadius / 2;
        }
      });
    }
  }

  public get hovering(): boolean {
    return this._hovering;
  }

  public get currentNode(): NavigationNode {
    return this.current;
  }

  public get hoveringNode(): NavigationNode {
    const view = this.nodeViews.find(v => v.state === NavigationNodeViewState.MouseHover);
    if (view != null) {
      return view.node;
    } else {
      return null;
    }
  }

  constructor(private context: CanvasRenderingContext2D, private nodeNavigationService: NodeNavigationService) {
    super();
    this.width = window.innerWidth * window.devicePixelRatio;
    this.height = window.innerHeight * window.devicePixelRatio;
    this.value().pipe(takeUntil(this.destroy$)).subscribe(_ => {
      this.update();
      this.render();
    });
    this.nodeNavigationService.group().pipe(first()).subscribe(node => {
      this.root = node;
      this.current = node;
      this.initialize();
    });
    this.nodeNavigationService.group().pipe(takeUntil(this.destroy$), skip(1)).subscribe(node => {
      const lastNode = this.current;
      this.current = node;
      if (node === lastNode.parent) {
        this.runGroupRetractAnimation(node, lastNode);
      } else {
        this.runGroupExpandAnimation(node, lastNode);
      }
    });
    this.nodeNavigationService.pageOpened().pipe(takeUntil(this.destroy$)).subscribe(node => {
      if (this.isRunning()) {
        this.runMaskExpandAnimation(node);
      }
    });
    this.nodeNavigationService.pageClosed().pipe(takeUntil(this.destroy$)).subscribe(node => {
      if (!this.isRunning()) {
        this.runMaskRetractAnimation(node);
      }
    });
  }

  /**
   * Initializes the renderer
   */
  public initialize() {
    for (const view of this.nodeViews) {
      view.destroy();
    }
    this.nodeViews = [];
    this.nodeLinks = [];
    this._hovering = false;
    this.createNodes(this.current, new Vector(this.width / 2, this.height / 2), this.rootRadius);
  }

  /**
   * Destroyes all subscriptions
   */
  public destroy() {
    this.destroy$.next();
  }

  /**
   * Whether to process user clicks
   * @returns true if user clicks should be handled
   */
  public clickable(): boolean {
    return !this.expanding && this.isRunning();
  }

  /**
   * Whether the canvas mask is active or not
   * @returns true if canvas mask is active
   */
  public isMasking(): boolean {
    return this.maskRadius > 0;
  }

  /**
   * Get the stream of animation events
   * @returns an observable streaming animation events
   */
  public animationEvent(): Observable<AnimationEvent> {
    return this.event$.asObservable();
  }

  /**
   * The main render loop
   */
  public render() {
    this.context.restore();
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.drawLines();
    this.drawNodes();
    this.context.save();
    this.maskCanvas();
  }

  /**
   * Creates a mask over the canvas - used for page expanding animations
   */
  private maskCanvas() {
    const region = new Path2D();
    region.arc(this.maskPosition.x, this.maskPosition.y, this.maskRadius, 0, 2 * Math.PI);
    this.context.clip(region, 'evenodd');
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = `rgba(255, 255, 255, ${this.maskOpacity})`;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draws the canvases background gradient
   */
  private drawBackground() {
    this.context.lineWidth = 1;
    const gradient = this.context.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, this.GradientStart);
    gradient.addColorStop(1, this.GradientEnd);
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draws all of the lines
   */
  private drawLines() {
    for (const line of this.nodeLinks) {
      this.context.strokeStyle = Color.white().fade(line.opacity).toRGBAString();
      this.context.beginPath();
      this.context.moveTo(line.view1.position.x, line.view1.position.y);
      this.context.lineTo(line.view2.position.x, line.view2.position.y);
      this.context.stroke();
    }
  }

  /**
   * Draws all of the nodes
   */
  private drawNodes() {
    for (const view of this.nodeViews) {
      // Draw the circle
      this.context.beginPath();
      this.context.arc(view.position.x, view.position.y, view.resolvedRadius, 0, 2 * Math.PI);
      this.context.fillStyle = view.foreground.fade(view.opacity).toRGBAString();
      this.context.strokeStyle = view.background.fade(view.opacity).toRGBAString();
      this.context.lineWidth = view.resolvedRadius / 50;
      this.context.fill();
      this.context.stroke();
      // Draw the title
      this.context.fillStyle = view.text.fade(view.opacity).toRGBAString();
      this.drawWrappedText(view.node.name, view.resolvedRadius / 2, 0.9 * 2 * view.resolvedRadius, view.position, true, true);
      // Draw the sub-title
      const below = new Vector(view.position.x, view.position.y + view.resolvedRadius / 4);
      this.context.fillStyle = view.text.fade(view.expanded * view.opacity).toRGBAString();
      if (this.canNavigateUpstream(view)) {
        // TODO: refactor this
        const y = view.position.y + view.resolvedRadius / 3;
        const x = view.position.x;
        this.context.strokeStyle = 'white';
        this.context.fillStyle = 'white';
        this.context.lineWidth = view.resolvedRadius / 12;
        const width = this.context.lineWidth * 6;
        this.context.beginPath();
        this.context.moveTo(x + width / 2, y);
        this.context.lineTo(x - width / 2 + this.context.lineWidth / 2, y);
        this.context.stroke();
        this.context.moveTo(x - width / 2, y);
        this.context.lineTo(x - width / 2 + this.context.lineWidth * 1.5, y + this.context.lineWidth * 1.5);
        this.context.lineTo(x - width / 2 + this.context.lineWidth * 1.5, y - this.context.lineWidth * 1.5);
        this.context.closePath();
        this.context.fill();
      } else {
        this.drawWrappedText(
          view.node.description,
          view.expanded * 2 * view.resolvedRadius / 12,
          view.expanded * 0.8 * 2 * view.resolvedRadius,
          below,
          true
        );
      }
    }
  }

  /**
   * The main update loop - calculates collision and pull to cursor
   */
  public update() {
    // Update position and apply acceleration due to either curve or mouse
    let hovering = false;
    for (const view of this.nodeViews) {
      if (!view.recycling) {
        const direction = this.mouse.subtract(view.position);
        const dist = direction.norm();
        if (view.state !== NavigationNodeViewState.Highlighted && view.state !== NavigationNodeViewState.Transition) {
          if (dist < view.resolvedRadius * view.scale) {
            view.state = NavigationNodeViewState.MouseHover;
            view.interpolator.pause();
            view.expanded = (1 - (dist / view.resolvedRadius));
            view.scale = 1 + (this.ExpandPercent / 100) * view.expanded;
          } else if (view.state === NavigationNodeViewState.MouseHover) {
            view.state = NavigationNodeViewState.Floating;
            view.expanded = 0;
            view.scale = 1;
            view.interpolator.continue();
          }
          hovering = hovering || view.state === NavigationNodeViewState.MouseHover;
          if (view.state === NavigationNodeViewState.MouseHover) {
            view.velocity = direction.divide(500);
            view.acceleration = new Vector(0, 0);
          } else {
            const pull = new Vector(this.width / 2, this.height / 2).subtract(view.position).unit().multiply(Acceleration);
            view.acceleration = view.acceleration.multiply(1 / 4).add(pull.multiply(3 / 4));
          }
          view.position = view.position.add(view.velocity.multiply(AnimationPeriod));
          view.velocity = view.velocity.add(view.acceleration.multiply(AnimationPeriod));
          if (view.velocity.norm() > this.MaximumVelocity) {
            view.velocity = view.velocity.unit().multiply(this.MaximumVelocity);
          }
        }
      }
    }
    if (this.hovering !== hovering) {
      this._hovering = hovering;
    }
    this.collisionDetection();
  }

  private collisionDetection() {
    const collisions = [];
    const hoveringNode = this.hoveringNode;
    for (const view of this.nodeViews) {
      if (!view.recycling) {
        for (const other of this.nodeViews) {
          const found1 = collisions.find(value => value[0] === view && value[1] === other);
          const found2 = collisions.find(value => value[0] === other && value[1] === view);
          if (!other.recycling && view !== other && found1 == null && found2 == null) {
            const direction = other.position.subtract(view.position);
            const overlap = view.resolvedRadius + other.resolvedRadius - direction.norm();
            if (overlap > 0) {
              const offset = direction.unit().multiply(overlap / 2);
              view.position = view.position.subtract(offset);
              other.position = other.position.add(offset);
              const viewVelocityPrime = this.computeCollisionVelocity(other, view);
              other.velocity = this.computeCollisionVelocity(view, other);
              view.velocity = viewVelocityPrime;
              collisions.push([view, other]);
            }
          }
        }
        // With bounding box
        const radius = view.resolvedRadius;
        if (view.position.x - radius < 0) {
          view.position.x = radius;
          view.velocity.x = -view.velocity.x;
        } else if (view.position.x + radius > this.width) {
          view.position.x = this.width - radius;
          view.velocity.x = -view.velocity.x;
        }
        if (view.position.y - radius < 0) {
          view.position.y = radius;
          view.velocity.y = -view.velocity.y;
        } else if (view.position.y + radius > this.height) {
          view.position.y = this.height - radius;
          view.velocity.y = -view.velocity.y;
        }
      }
    }
  }

  /**
   * Compute the velocity of view2 after collision of view1 into view2
   * @param view1 the view colliding into view2
   * @param view2 the view to compute the velocity for
   */
  private computeCollisionVelocity(view1: NavigationNodeView, view2: NavigationNodeView) {
    const deltaV = view2.velocity.subtract(view1.velocity);
    const deltaX = view2.position.subtract(view1.position);
    return view2.velocity.subtract(
      deltaX.multiply(((2 * view1.mass) / (view1.mass + view2.mass)) * deltaV.dot(deltaX) / deltaX.dot(deltaX))
    );
  }

  /**
   * Initiates canvas mask expansion animation -> expanding pinhole animation
   * @param node the node for which to animate from
   */
  private runMaskExpandAnimation(node: NavigationNode) {
    const view = this.nodeViews.find(v => v.node === node);
    this.expanding = true;
    this.maskPosition.x = view.position.x;
    this.maskPosition.y = view.position.y;
    this.maskRadius = 0;
    this.maskOpacity = 1.0;
    const interpolator = new LinearInterpolator(this.ExpandTime);
    const done$ = new Subject();
    this.event$.next(AnimationEvent.PageExpanding);
    interpolator.value().pipe(takeUntil(done$)).subscribe(t => {
      this.maskRadius = t * Math.max(this.width, this.height) * Math.sqrt(2);
      this.maskOpacity = 1 - t;
    });
    interpolator.complete().pipe(first()).subscribe(_ => {
      this.expanding = false;
      this.maskOpacity = 0;
      done$.next();
      this.stop();
    });
    interpolator.start();
  }

  /**
   * Initiates canvas mask retraction animation -> retracting pinhole animation
   * @param node the node for which to animate from
   */
  private runMaskRetractAnimation(node: NavigationNode) {
    const view = this.nodeViews.find(v => v.node === node);
    this.expanding = true;
    this.maskPosition.x = view.position.x;
    this.maskPosition.y = view.position.y;
    this.maskRadius = Math.max(this.width, this.height);
    this.maskOpacity = 0.0;
    this.start();
    const interpolator = new LinearInterpolator(this.ExpandTime);
    const done$ = new Subject();
    interpolator.value().pipe(takeUntil(done$)).subscribe(t => {
      this.maskPosition.x = view.position.x;
      this.maskPosition.y = view.position.y;
      this.maskRadius = (1 - t) * Math.max(this.width, this.height) * Math.sqrt(2);
      this.maskOpacity = t;
    });
    interpolator.complete().pipe(first()).subscribe(_ => {
      this.expanding = false;
      done$.next();
      this.maskRadius = 0;
      this.maskOpacity = 1;
      this.start();
      this.event$.next(AnimationEvent.PageRetracted);
    });
    interpolator.start();
  }

  /**
   * Initiates canvas group expansion animation -> transitions in a given groups children
   * while transitioning out the parents children
   * @param next the next group node
   * @param last the previous group node
   */
  private runGroupExpandAnimation(next: NavigationNode, last: NavigationNode) {
    const interpolator = new BezierInterpolator(this.ExpandTime , BezierCurve.cubicTransition());
    let nextView: NavigationNodeView;
    nextView = this.nodeViews.find(v => v.node === next);
    this.nodeViews.forEach(view => view.recycling = view !== nextView);
    const newViews = this.setupViewChildren(nextView);
    newViews.forEach(view => {
      view.radius = 0;
      view.opacity = 0;
      this.nodeLinks.push(new NavigationNodeLink(nextView, view, 0));
    });
    this.nodeViews.push(...newViews);
    const index = this.nodeViews.indexOf(nextView);
    this.nodeViews[index] = this.nodeViews[this.nodeViews.length - 1];
    this.nodeViews[this.nodeViews.length - 1] = nextView;

    const done$ = new Subject();
    interpolator.value().pipe(takeUntil(done$)).subscribe(value => {
      for (const view of this.nodeViews) {
        if (!view.recycling) {
          if (view === nextView) {
            view.foreground = Color.mix(Color.white(), Color.black(), value.t);
            view.text = Color.mix(Color.gray(), Color.white(), value.t);
            view.background = Color.mix(Color.black(), Color.white(), value.t);
            view.radius = nextView.radius * (1 - value.t) + this.rootRadius * value.t;
          } else {
            view.opacity = value.t;
            view.radius = (this.rootRadius / 2) * value.t;
          }
        }
      }
      this.recycleAnimation(nextView.position, value.t);
    });
    interpolator.complete().pipe(first()).subscribe(value => {
      done$.next();
      this.recycle(nextView);
      this.expanding = false;
      nextView.foreground = Color.black();
      nextView.text = Color.white();
      nextView.background = Color.white();
      this.event$.next(AnimationEvent.GroupExpanded);
    });
    interpolator.start();
  }

  /**
   * Initiates canvas group retraction animation -> transitions in the parent groups children
   * while transitioning out the childs children
   * @param next the next group node
   * @param last the previous group node
   */
  private runGroupRetractAnimation(next: NavigationNode, last: NavigationNode) {
    const interpolator = new BezierInterpolator(this.ExpandTime , BezierCurve.cubicTransition());
    const lastView = this.nodeViews.find(v => v.node === last);
    const nextView = new NavigationNodeView(next, new Vector(lastView.position.x, lastView.position.y), 0);
    nextView.opacity = 0;
    this.nodeViews.forEach(view => view.recycling = view !== nextView && view !== lastView);
    this.nodeLinks.push(new NavigationNodeLink(nextView, lastView, 0));
    this.nodeViews.push(nextView);
    const newViews = this.setupViewChildren(nextView).filter(v => v.node !== lastView.node);
    newViews.forEach(view => {
      view.radius = 0;
      view.opacity = 0;
      this.nodeLinks.push(new NavigationNodeLink(nextView, view, 0));
    });
    this.nodeViews.push(...newViews);
    const index = this.nodeViews.indexOf(nextView);
    this.nodeViews[index] = this.nodeViews[this.nodeViews.length - 1];
    this.nodeViews[this.nodeViews.length - 1] = nextView;

    const done$ = new Subject();
    interpolator.value().pipe(takeUntil(done$)).subscribe(value => {
      for (const view of this.nodeViews) {
        if (!view.recycling) {
          if (view === lastView) {
            view.foreground = Color.mix(Color.white(), Color.black(), 1 - value.t);
            view.text = Color.mix(Color.gray(), Color.white(), 1 - value.t);
            view.background = Color.mix(Color.black(), Color.white(), 1 - value.t);
            view.radius = lastView.radius * (1 - value.t) + (this.rootRadius / 2) * value.t;
          } else {
            view.opacity = value.t;
            if (view === nextView) {
              view.radius = this.rootRadius * value.t;
            } else {
              view.radius = (this.rootRadius / 2) * value.t;
            }
          }
        }
      }
      this.recycleAnimation(nextView.position, value.t);
    });
    interpolator.complete().pipe(first()).subscribe(value => {
      done$.next();
      this.recycle(nextView);
      this.expanding = false;
      lastView.foreground = Color.white();
      lastView.text = Color.gray();
      lastView.background = Color.black();
      this.event$.next(AnimationEvent.GroupRetracted);
    });
    interpolator.start();
  }

  /**
   * Update loop for the fading transition of recycled nodes
   * @param repel the position to repel from
   * @param t the transition coordinate
   */
  private recycleAnimation(repel: Vector, t: number) {
    for (const view of this.nodeViews) {
      if (view.recycling) {
        const direction = view.position.subtract(repel).unit();
        view.position = view.position.add(direction.multiply(this.MaximumVelocity * 5 * AnimationPeriod));
        view.opacity = 1 - t;
        view.radius *= 0.95;
      }
    }
    for (const line of this.nodeLinks) {
      if (line.view1.recycling || line.view2.recycling) {
        line.opacity = 1 - t;
      } else {
        line.opacity = t;
      }
    }
  }

  /**
   * Recycles all flaged nodes
   * @param nextView the next root view
   */
  private recycle(nextView: NavigationNodeView) {
    this.nodeViews = this.nodeViews.filter(v => !v.recycling);
    this.nodeLinks = this.nodeLinks.filter(l => !l.view1.recycling && !l.view2.recycling);
    this.nodeViews.forEach(v => {
      v.opacity = 1;
      if (v === nextView) {
        v.radius = this.rootRadius;
      } else {
        v.radius = this.rootRadius / 2;
      }
    });
    this.nodeLinks.forEach(l => l.opacity = 1);
  }

  /**
   * Draws text on canvas fitting inside a bounding box
   * @param text the text to draw
   * @param size the font size
   * @param width the bounding box width
   * @param position the center of the bounding box
   * @param centered whether the text is centered
   * @param adjustSize will scale text to fit in bounding box if set to true
   */
  private drawWrappedText(
    text: string,
    size: number,
    width: number,
    position: Vector,
    centered: boolean = true,
    adjustSize: boolean = false
  ) {
    this.context.font = `${size}px Roboto`;
    const words = text.split(' ');
    let current = '';
    let currentWidth = 0;
    let maxWidth = 0;
    let offset = 0;
    const space = this.context.measureText(' ');
    const lines = [];
    let firstWord = true;
    for (const word of words) {
      const metrics = this.context.measureText(word);
      if (currentWidth + space.width + metrics.width <= width) {
        current = firstWord ? current + word : current + ' ' + word;
        firstWord = false;
        currentWidth = firstWord ? metrics.width : currentWidth + space.width + metrics.width;
      } else if (adjustSize && lines.length === 0) {
        this.drawWrappedText(
          text,
          (width / (currentWidth + space.width + metrics.width)) * size - 1,
          width,
          position,
          centered,
          false
        );
        break;
      } else {
        lines.push({
          text: current,
          width: currentWidth - space.width
        });
        maxWidth = Math.max(maxWidth, currentWidth);
        currentWidth = metrics.width;
        current = word;
      }
    }
    lines.push({
      text: current,
      width: currentWidth - space.width
    });
    maxWidth = Math.max(maxWidth, currentWidth);
    for (const line of lines) {
      const p = new Vector(position.x, position.y + offset);
      if (centered) {
        p.x -= line.width / 2;
      }
      this.context.fillText(line.text, p.x, p.y, width);
      offset += size;
    }
  }

  /**
   * Generates a group of nodes
   * @param groupNode the group node to generate
   * @param center the center of the group
   * @param radius the radius of the group node
   */
  private createNodes(groupNode: NavigationNode, center: Vector, radius: number) {
    const view = new NavigationNodeView(groupNode, center, radius);
    this.nodeViews.push(view);
    view.interpolator.start();

    const childViews = this.setupViewChildren(view);
    for (const child of childViews) {
      this.nodeLinks.push(new NavigationNodeLink(view, child));
      child.interpolator.start();
    }
    this.nodeViews.unshift(...childViews);
  }

  /**
   * Sets up a group views children by wrapping them around the group node
   * @param groupView the group view
   */
  private setupViewChildren(groupView: NavigationNodeView): NavigationNodeView[] {
    const views = [];
    let offset = new Vector(0, Math.min(this.width, this.height) / 3);
    const deltaTheta = (2 * Math.PI) / groupView.node.children.length;
    for (const child of groupView.node.children) {
      const point = groupView.position.add(offset);
      const childView = new NavigationNodeView(child, point, groupView.radius / 2);
      offset = rotatePoint(offset, deltaTheta);
      views.push(childView);
    }
    return views;
  }

  /**
   * Determines if a given view can navigate upstream -> a group view that has a parent
   * @param view the view to check
   */
  private canNavigateUpstream(view: NavigationNodeView): boolean {
    return (view.node === this.current || view.recycling) &&
      view.node !== this.root &&
      view.node.type === NavigationNodeType.Group;
  }
}
