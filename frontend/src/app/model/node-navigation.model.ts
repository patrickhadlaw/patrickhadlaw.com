import { NavigationExtras } from '@angular/router';
import { InjectionToken, Type } from '@angular/core';
import { Color } from '../util/color';
import { Vector } from '../util/vector';
import { BezierCurve } from '../util/bezier';
import { ContinuousBezierInterpolator } from '../util/animate';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export const NodeNavigationToken = new InjectionToken<string>('nodeNavigation');

export interface NavigationNodeConfig {
  name: string;
  description: string;
  route?: string;
  highlight?: Type<any>;
  children?: NavigationNodeConfig[];
  extras?: NavigationExtras;
}

export enum NavigationNodeType {
  Group,
  Route,
  ExternalUrl,
  Highlight,
  Undefined
}

export class NavigationNode {
  private _type: NavigationNodeType;
  private _parent: NavigationNode;
  private _name: string;
  private _description: string;
  private _route: string;
  private _highlight: Type<any>;
  private _extras: NavigationExtras = {};
  private _children: NavigationNode[] = [];

  public get type(): NavigationNodeType {
    return this._type;
  }

  public get parent(): NavigationNode {
    return this._parent;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get route(): string {
    return this._route;
  }

  public get highlight(): Type<any> {
    return this._highlight;
  }

  public get extras(): NavigationExtras {
    return this._extras;
  }

  public get children(): NavigationNode[] {
    return this._children;
  }

  constructor(name?: string, route?: string) {
    this._name = name;
    this._route = route;
    this._description = '';
  }

  public static fromConfig(config: NavigationNodeConfig): NavigationNode {
    const node: NavigationNode = new NavigationNode();
    node._name = config.name;
    node._description = config.description;
    node._route = config.route;
    node._highlight = config.highlight;
    node._extras = config.extras != null ? config.extras : {};
    node._children = [];
    if (node.route != null) {
      if (node.route === '/external') {
        node._type = NavigationNodeType.ExternalUrl;
      } else {
        node._type = NavigationNodeType.Route;
      }
    } else if (node.highlight != null) {
      node._type = NavigationNodeType.Highlight;
    } else if (config.children.length > 0) {
      node._type = NavigationNodeType.Group;
    } else {
      node._type = NavigationNodeType.Undefined;
    }
    if (config.children != null) {
      for (const child of config.children) {
        node._children.push(NavigationNode.fromConfig(child));
      }
    }
    node.initialize();
    return node;
  }

  public find(predicate: (node: NavigationNode) => boolean): NavigationNode {
    if (predicate(this)) {
      return this;
    } else if (this.children.length > 0) {
      for (const child of this.children) {
        const result = child.find(predicate);
        if (result != null) {
          return result;
        }
      }
    } else {
      return null;
    }
  }

  private initialize() {
    for (const child of this._children) {
      child._parent = this;
    }
  }
}

export const AnimationTime = 10000;

export const Acceleration = 0.0001;

export enum NavigationNodeViewState {
  Floating,
  MouseHover,
  Highlighted,
  Transition
}

export class NavigationNodeView {

  public state = NavigationNodeViewState.Floating;

  public foreground = Color.white();
  public text = Color.gray();
  public background = Color.black();

  public position = new Vector(0, 0);
  public velocity = new Vector(0, 0);
  public acceleration = new Vector(0, 0);

  public node: NavigationNode;
  public opacity = 1.0;
  public radius = 0;
  public scale = 1;
  public expanded = 0;
  public recycling = false;

  public curve: BezierCurve;
  public interpolator: ContinuousBezierInterpolator;

  private destroy$ = new Subject();

  public get resolvedRadius(): number {
    return this.radius * this.scale;
  }

  public get mass(): number {
    const r = this.resolvedRadius;
    return Math.PI * r * r;
  }

  constructor(node: NavigationNode, center: Vector, radius: number = 50) {
    const lower = new Vector(-1, -1);
    this.curve = NavigationNodeView.randomForceCurve(lower, lower.negate());
    this.position = new Vector(center.x, center.y);
    this.radius = radius;
    this.node = node;
    this.interpolator = new ContinuousBezierInterpolator(Math.floor(AnimationTime * (Math.random() + 1)), this.curve);
    this.interpolator.value().pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.acceleration = value.point.unit().multiply(Acceleration);
    });
    this.interpolator.start();
  }

  private static randomForceCurve(lower: Vector, upper: Vector): BezierCurve {
    const controls = [];
    for (let i = 0; i < Math.floor(Math.random() * 5) + 6; i++) {
      controls.push(new Vector(
        Math.random() * (upper.x - lower.x) + lower.x,
        Math.random() * (upper.y - lower.y) + lower.y
      ));
    }
    return new BezierCurve(...controls);
  }

  public destroy() {
    this.destroy$.next();
  }
}

export class NavigationNodeLink {
  constructor(public view1: NavigationNodeView, public view2: NavigationNodeView, public opacity = 1) { }
}

export const navigation: NavigationNodeConfig = {
  name: 'Me',
  description: 'Click here to learn more about me or to contact me!',
  route: '/about-me',
  children: [
    {
      name: 'Experience',
      description: 'Click here to learn more about my work experience',
      route: '/experience'
    },
    {
      name: 'Skills',
      description: 'Click here to learn more about my skills',
      route: '/skills'
    },
    {
      name: 'Projects',
      description: 'Click here to see some of my side projects on Github',
      children: [
        {
          name: 'RGLEngine',
          description: 'A real-time GUI and 3D renderer featuring GPU accelerated raytracing',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/RGLEngine' } as NavigationExtras
        },
        {
          name: 'cpp-vulkan',
          description: 'A Vulkan API project',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/cpp-vulkan' } as NavigationExtras
        },
        {
          name: 'The-Brachistochrone-Curve',
          description: 'A web app/game relating to the brachistochrone curve',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/The-Brachistochrone-Curve' } as NavigationExtras
        },
        {
          name: 'drumbeat-rs',
          description: 'A published rust async and event crate targeted towards game engines',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/drumbeat-rs' } as NavigationExtras
        },
        {
          name: 'motionpong',
          description: 'A pong game controlled by motion of hands in front of sensors',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/motionpong' } as NavigationExtras
        },
        {
          name: 'patrickhadlaw.com',
          description: 'This website',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/patrickhadlaw.com' } as NavigationExtras
        }
      ]
    }
  ]
};
