import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { NavigationNode, NavigationNodeConfig, NodeNavigationToken } from '../../model/node-navigation.model';

@Injectable()
export class NodeNavigationService {
  private root$: BehaviorSubject<NavigationNode>;
  private current$: BehaviorSubject<NavigationNode>;

  constructor(@Inject(NodeNavigationToken) config: NavigationNodeConfig) {
    const node = NavigationNode.fromConfig(config);
    this.root$ = new BehaviorSubject<NavigationNode>(node);
    this.current$ = new BehaviorSubject<NavigationNode>(node);
  }

  public navigate(name: string) {
    const parent = this.current$.getValue().parent;
    if (parent != null && parent.name === name) {
      this.current$.next(this.current$.getValue().parent);
    } else {
      for (const child of this.current$.getValue().children) {
        if (child.name === name) {
          this.current$.next(child);
          return;
        }
      }
    }
  }

  public root(): Observable<NavigationNode> {
    return this.root$.asObservable();
  }
  public current(): Observable<NavigationNode> {
    return this.current$.asObservable();
  }
}
