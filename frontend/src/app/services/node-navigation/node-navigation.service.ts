import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { NavigationNode, NavigationNodeConfig, NodeNavigationToken, NavigationNodeType } from '../../model/node-navigation.model';
import { Router, NavigationStart } from '@angular/router';
import { first, filter } from 'rxjs/operators';

@Injectable()
export class NodeNavigationService {

  private root$: BehaviorSubject<NavigationNode>;
  private group$: BehaviorSubject<NavigationNode>;
  private openedPage: NavigationNode;
  private pageOpened$ = new Subject<NavigationNode>();
  private pageClosed$ = new Subject<NavigationNode>();

  constructor(@Inject(NodeNavigationToken) config: NavigationNodeConfig, private router: Router) {
    const root = NavigationNode.fromConfig(config);
    this.root$ = new BehaviorSubject<NavigationNode>(root);
    this.router.events.pipe(filter(event => event instanceof NavigationStart), first()).subscribe((event: NavigationStart) => {
      const found = root.find(node => node.route === event.url.split('#')[0]);
      if (found != null) {
        if (found.children.length > 0) {
          this.group$ = new BehaviorSubject<NavigationNode>(found);
        } else {
          this.group$ = new BehaviorSubject<NavigationNode>(found.parent);
        }
      } else {
        this.group$ = new BehaviorSubject<NavigationNode>(root);
      }
      this.openedPage = found;
    });
  }

  /**
   * Triggers the page close event
   */
  public closePage() {
    this.pageClosed$.next(this.openedPage);
  }

  /**
   * Navigates to the given node
   * @param node the node to navigate to
   */
  public navigate(node: NavigationNode) {
    const parent = this.group$.getValue().parent;
    if (node === parent) {
      this.group$.next(parent);
    } else {
      switch (node.type) {
        case NavigationNodeType.Group:
          this.group$.next(node);
          break;
        default:
          this.openedPage = node;
          this.pageOpened$.next(node);
      }
    }
  }

  /**
   * Observe the root node
   * @returns an observable of the root node
   */
  public root(): Observable<NavigationNode> {
    return this.root$.asObservable();
  }

  /**
   * Observe the current selected group
   * @returns an observable of the current selected group
   */
  public group(): Observable<NavigationNode> {
    return this.group$.asObservable();
  }

  /**
   * Observe page open events
   * @returns an observable of page open events
   */
  public pageOpened(): Observable<NavigationNode> {
    return this.pageOpened$.asObservable();
  }

  /**
   * Observe page close events
   * @returns an observable of page close events
   */
  public pageClosed(): Observable<NavigationNode> {
    return this.pageClosed$.asObservable();
  }
}
