import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { NavigationExtras } from "@angular/router";

export class NavigationNode {
    public parent: NavigationNode = null;
    public name: string;
    public route: string;
    public extras: NavigationExtras = {};
    public children: NavigationNode[] = [];

    constructor(name: string = "undefined", route: string = undefined) {
        this.name = name
        this.route = route;
    }

    public static fromJSON(json: any): NavigationNode {
        let node: NavigationNode = new NavigationNode();
        Object.assign(node, json);
        node.children = [];

        if (json.children != null) {
            for (let i = 0; i < json.children.length; i++) {
                node.children.push(this.fromJSON(json.children[i]));
            }
        }

        node._initialize();
        console.log(node);
        return node;
    }

    public isRouted(): boolean {
        return this.route != null;
    }

    private _initialize() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].parent = this;
        }
    }
}

@Injectable()
export class NodeNavigationService {
    private static _root: NavigationNode;
    private static _current: NavigationNode;
    private static _initialized: boolean = false;

    constructor() {
        NodeNavigationService._root = new NavigationNode();
    }

    public set(root: NavigationNode) {
        NodeNavigationService._root = root;
        NodeNavigationService._current = NodeNavigationService._root;
        NodeNavigationService._initialized = true;
    }

    public initialized(): boolean {
        return NodeNavigationService._initialized;
    }

    public navigateDownstream(childName: string) {
        for (let i = 0; i < NodeNavigationService._current.children.length; i++) {
            if (NodeNavigationService._current.children[i].name === childName) {
                NodeNavigationService._current = NodeNavigationService._current.children[i];
                return;
            }
        }
    }
    public navigateUpstream() {
        NodeNavigationService._current = NodeNavigationService._current.parent;
    }

    public observe(): Observable<NavigationNode> {
        return of(NodeNavigationService._current);
    }
}