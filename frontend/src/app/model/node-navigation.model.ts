import { NavigationExtras } from '@angular/router';
import { InjectionToken } from '@angular/core';

export const NodeNavigationToken = new InjectionToken<string>('nodeNavigation');

export interface NavigationNodeConfig {
  name: string;
  description: string;
  route?: string;
  children?: NavigationNodeConfig[];
  extras?: NavigationExtras;
}

export class NavigationNode {
  private _parent: NavigationNode;
  private _name: string;
  private _description: string;
  private _route: string;
  private _extras: NavigationExtras = {};
  private _children: NavigationNode[] = [];

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
    node._extras = config.extras != null ? config.extras : {};
    node._children = [];
    if (config.children != null) {
      for (const child of config.children) {
        node._children.push(NavigationNode.fromConfig(child));
      }
    }
    node.initialize();
    return node;
  }

  public isRouted(): boolean {
    return this.route != null;
  }

  public externalRoute(): boolean {
    return this.route === '/external';
  }

  private initialize() {
    for (const child of this._children) {
      child._parent = this;
    }
  }
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
          name: 'cpp-opengl',
          description: 'A real-time GUI and 3D renderer',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/cpp-opengl' } as NavigationExtras
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
          name: 'py-mod-sort',
          description: 'Sorting algorithm visualization',
          route: '/external',
          extras: { externalUrl: 'https://github.com/patrickhadlaw/py-mod-sort' } as NavigationExtras
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
