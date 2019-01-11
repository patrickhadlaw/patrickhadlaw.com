import { Component, ViewChild, ElementRef, OnInit, Input, AfterViewInit } from '@angular/core';
import { NodeNavigationService, NavigationNode } from '../services/node-navigation.service';
import { Router } from '@angular/router';

import { Interpolator, ContinuousBezierInterpolator, LinearInterpolator } from '../animate';
import { rotatePoint, Vector } from '../vector';
import { BezierCurve } from '../bezier';

const ANIMATION_TIME = 60000;

class NodeView {
    constructor() {
        this.position = new Vector(0, 0);
        this.pull = new Vector(0, 0);
        this.expanded = 0.0;
        this.opacity = 1.0;
        this.scale = 1.0;
        this.description = '';
    }
    public title: string;
    public description: string;
    public position: Vector;
    public pull: Vector;
    public get resolved(): Vector {
        return this.position.add(this.pull);
    }
    public expanded: number;
    public baseRadius: number;
    public radius: number;
    public scale: number;
    public path: BezierCurve;
    public time: number;
    public node: NavigationNode;
    public interpolator: Interpolator;
    public opacity: number;
    public get group(): boolean {
        return this.node.children.length > 0 && !this.node.isRouted();
    }
}

class NodeLine {
    constructor() { }
    public view1: NodeView;
    public view2: NodeView;
    public interpolator: Interpolator;
}

@Component({
    selector: 'app-node-navigation',
    templateUrl: './node-navigation.component.html',
    styleUrls: ['./node-navigation.component.scss']
})
export class NodeNavigationComponent implements OnInit, AfterViewInit {
    svgElement: ElementRef;
    @ViewChild('root') set root(root: ElementRef) {
        this.svgElement = root;
    }
    @ViewChild('nodes') nodesElement: ElementRef;

    @Input('bubble-fill') bubbleFill: string = '#ffffff';
    @Input('bubble-stroke') bubbleStroke: string = '#004466';

    private _current: NavigationNode;
    public set current(value: NavigationNode) {
        this._current = value;
        this.navigationService.current = value;
    }
    public get current(): NavigationNode {
        return this._current;
    }
    clipPath: string = '';
    width: number = 0;
    height: number = 0;
    get pull(): number {
        return this.precedent.radius;
    }

    mouse: Vector = new Vector(0, 0);

    active: boolean = true;

    maskPosition: Vector = new Vector(0, 0);
    maskRadius: number = 0;
    maskOpacity: number = 1.0;

    minDistance: number = -1;
    precedent: NodeView;

    expander: Interpolator;

    nodeViews: NodeView[] = [];
    nodeLines: NodeLine[] = [];
    backgroundViews: NodeView[] = [];
    backgroundLines: NodeLine[] = [];

    constructor(private navigationService: NodeNavigationService, private router: Router) {

    }

    ngOnInit() {
        if (window.location.hash) {
            this.active = false;
        } else {
            this.active = true;
        }
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    ngAfterViewInit() {
        this.navigationService.observeRoot().subscribe((node) => {
            this.update(node);
        });
        window.addEventListener('resize', () => { this.onResize() });
        window.addEventListener('mousemove', (event: MouseEvent) => { this.onMouseMove(event.pageX, event.pageY) });
        window.addEventListener('touchstart', (event: TouchEvent) => { this.onMouseMove(event.touches[0].pageX, event.touches[0].pageY) });
        window.addEventListener('touchmove', (event: TouchEvent) => { this.onMouseMove(event.touches[0].pageX, event.touches[0].pageY) });
        window.addEventListener('touchend', (event: TouchEvent) => { this.onMouseMove(-this.width, -this.height) });
    }

    public update(node: NavigationNode) {
        for (let view of this.nodeViews) {
            view.interpolator.stop();
        }
        for (let view of this.backgroundViews) {
            view.interpolator.stop();
        }
        this.nodeViews = [];
        this.nodeLines = [];
        this.backgroundViews = [];
        this.backgroundLines = [];

        this.current = node;
        this.createNodes(node, new Vector(this.width / 2, this.height / 2), this.height / 8);
        this.createBackground();
    }

    public onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.update(this.current);
    }

    public onMouseMove(x: number, y: number) {
        this.mouse.x = x;
        this.mouse.y = y;
    }

    public findPrecedent() {
        let max = 0;
        for (let view of this.nodeViews) {
            let sep = view.resolved.subtract(this.mouse);
            let dist = sep.norm();
            if (dist < view.radius) {
                this.precedent = view;
                break;
            }
            if (view.radius > max) {
                this.precedent = view;
                max = view.radius;
            }
        }
    }

    public adjustView(view: NodeView) {
        let mouseSeperation = view.resolved.subtract(this.mouse);
        let mouseDist = mouseSeperation.norm();
        this.findPrecedent();
        if (view === this.precedent) {
            if (mouseDist < this.pull) {
                view.pull = view.pull.add(mouseSeperation.multiply(0.1).negate());                    
            } else {
                view.pull = view.pull.multiply(0.9);                    
            }
        }
        view.expanded = Math.max(0, this.pull - mouseDist) / this.pull;
        view.radius = (view.baseRadius) * (view.expanded / 2 + 1);
        if (view !== this.precedent) {
            let collided = false;
            for (let compare of this.nodeViews) {
                if (compare !== view) {
                    let resolvedSeperation = view.resolved.subtract(compare.resolved);
                    let resolvedDist = resolvedSeperation.norm();
                    if (resolvedDist < (view.radius + compare.radius)*11/10) {
                        view.pull = view.pull.add(
                            resolvedSeperation.unit().multiply(resolvedDist - (compare.radius + view.radius)*11/10).negate().multiply(0.9)
                        );
                    }
                }
            }
            if (!collided) {
                view.pull = view.pull.multiply(0.9);
            }
        }
    }

    public setupView(node: NavigationNode, center: Vector, radius: number = 50): NodeView {
        let view = new NodeView();
        view.position.x = center.x;
        view.position.y = center.y;
        view.radius = radius;
        view.baseRadius = radius;
        view.title = node.name;
        view.description = node.description;
        view.time = Math.floor(ANIMATION_TIME * (Math.random() + 1));
        view.node = node;
        let curve = this.randomCurveInRange(view.position,
            new Vector(radius, radius),
            new Vector(this.width - radius, this.height - radius)
        );
        view.interpolator = new ContinuousBezierInterpolator(view.time, curve,
            (point: Vector, t: number) => {
                view.position = point;
                this.adjustView(view);
            }
        );
        return view;
    }

    public setupViewChildren(view: NodeView): NodeView[] {
        let views = [];
        let offset = new Vector(0, Math.min(this.width, this.height) / 3);
        const deltaTheta = (2 * Math.PI) / view.node.children.length;
        for (let child of view.node.children) {
            let point = view.position.add(offset);
            let childView = this.setupView(child, point, view.radius / 2);
            offset = rotatePoint(offset, deltaTheta);
            views.push(childView);
        }
        return views;
    }

    public createNodes(node: NavigationNode, center: Vector, radius: number = 50) {
        let view = this.setupView(node, center, radius);
        this.nodeViews.push(view);
        view.interpolator.start();

        let childViews = this.setupViewChildren(view);
        for (let child of childViews) {
            let line = new NodeLine();
            line.view1 = view;
            line.view2 = child;
            this.nodeLines.push(line);
            child.interpolator.start();
        }
        this.nodeViews.unshift(...childViews);
    }

    public randomCurveInRange(start: Vector, lower: Vector, upper: Vector): BezierCurve {
        let controls = [new Vector(...start.data)];
        let first = new Vector(
            Math.floor(Math.random() * (upper.x - lower.x)) + lower.x,
            Math.floor(Math.random() * (upper.y - lower.y)) + lower.y);
        controls.push(first);
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
            controls.push(new Vector(
                Math.floor(Math.random() * (upper.x - lower.x)) + lower.x,
                Math.floor(Math.random() * (upper.y - lower.y)) + lower.y)
            );
            if (controls[i].x > upper.x || controls[i].y > upper.y) {

            }
        }
        let change = first.subtract(start);
        controls.push(start.add(change.negate()));
        controls.push(start);
        return new BezierCurve(...controls);
    }
    public randomCurve(start: Vector) {
        return this.randomCurveInRange(start, new Vector(-this.width / 2, -this.height / 2), new Vector(this.width * 3 / 2, this.height * 3 / 2));
    }
    public extendCurve(start: Vector, tangent: Vector): BezierCurve {
        let first = new Vector(...start.data);
        let controls = [first, first.add(tangent.unit().multiply(10))];
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
            controls.push(new Vector(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)));
        }
        return new BezierCurve(...controls);
    }

    public createBackground(nodes: number = 10) {
        for (let i = 0; i < nodes; i++) {
            let node = new NodeView();
            node.radius = Math.floor(Math.random() * this.width / 2) + this.width / 10;
            node.position.x = Math.floor(Math.random() * this.width);
            node.position.y = Math.floor(Math.random() * this.height);
            node.time = Math.floor(ANIMATION_TIME * (Math.random() + 1));
            node.path = this.randomCurve(node.position);
            node.interpolator = new ContinuousBezierInterpolator(node.time, this.randomCurve(node.position),
                (point: Vector, t: number) => {
                    node.position = point;
                }
            );
            this.backgroundViews.push(node);
            node.interpolator.start();
        }
    }

    public clickNode(view: NodeView) {
        if (this.active) {
            if (view.node.externalRoute()) {
                this.router.navigate([view.node.route, view.node.extras]);
            } else if (view.node.isRouted()) {
                this.current = view.node;
                this.expandPage(view);
            } else if (view.node === this.current) {
                this.current = view.node.parent;
                this.expandGroup(view, true);
            } else {
                this.current = view.node;
                this.expandGroup(view);
            }
        }
    }

    public expandPage(view: NodeView) {
        this.router.navigate([this.current.route, this.current.extras]);
        this.maskPosition.x = view.resolved.x;
        this.maskPosition.y = view.resolved.y;
        this.maskRadius = 0;
        this.maskOpacity = 1.0;
        this.expander = new LinearInterpolator(500, (value: number) => {
            this.maskRadius = value * Math.max(this.width, this.height);
            this.maskOpacity = 1 - value;
        }, () => { this.active = false; this.router.navigate([this.current.route, this.current.extras]); });
        this.expander.start();
    }

    public retractPage() {
        let find = null;
        for (let view of this.nodeViews) {
            if (view.node === this.current) {
                find = view;
            }
        }
        if (find == null) {
            throw 'failed to retract navigation page';
        }
        this.maskPosition.x = find.resolved.x;
        this.maskPosition.y = find.resolved.y;
        this.maskRadius = Math.max(this.width, this.height);
        this.maskOpacity = 0.0;
        this.active = true;
        this.expander = new LinearInterpolator(500, (value: number) => {
            this.maskRadius = (1 - value) * Math.max(this.width, this.height);
            this.maskOpacity = value;
        }, () => { this.router.navigateByUrl('/') });
        this.expander.start();
    }

    public expandGroup(view: NodeView, retract: boolean = false) {
        const numViews = this.nodeViews.length;
        let numComplete = 0;
        let target = null;
        if (retract) {
            target = this.setupView(view.node.parent, new Vector(this.width / 2, this.height / 2), this.height / 8);
        } else {
            target = this.setupView(view.node, new Vector(this.width / 2, this.height / 2), this.height / 8);
        }
        let finished = () => {
            view.baseRadius = target.baseRadius;
            view.title = target.title;
            view.description = target.description;
            view.node = target.node;
            view.opacity = 1.0;
            view.radius = view.radius;
            view.interpolator = new ContinuousBezierInterpolator(view.time, (target.interpolator as ContinuousBezierInterpolator).curve,
                (point: Vector, t: number) => {
                    view.position = point;
                    this.adjustView(view);
                }
            );
            this.nodeLines = [];
            let childViews = this.setupViewChildren(target);
            this.nodeViews = [...childViews, view];
            for (let child of childViews) {
                if (child !== view) {
                    let line = new NodeLine();
                    line.view1 = view;
                    line.view2 = child;
                    this.nodeLines.push(line);
                    child.pull = new Vector(this.width / 2, this.height / 2);
                    child.pull = child.pull.subtract(child.position);
                }
            }
            for (let child of this.nodeViews) {
                child.opacity = 1.0;
                child.interpolator.start();
            }
            this.precedent = view;
        };
        let t = 0.0;
        for (let child of this.nodeViews) {
            let complete = () => {
                numComplete++;
                if (numComplete >= numViews) finished();
            };
            if (child.node === this.current) {

            } else if (child !== view) {
                complete = () => {
                    let index = this.nodeViews.indexOf(child);
                    this.nodeViews.splice(index, 1);
                    numComplete++;
                    if (numComplete >= numViews) finished();    
                };
            }
            child.interpolator.stop();
            let initial = new Vector(...child.resolved.data);
            let radius = child.radius;
            let dir = new Vector(view.resolved.x - child.resolved.x, view.resolved.y - child.resolved.y);
            child.interpolator = new LinearInterpolator(500, (value: number) => {
                
                if (child === view) {
                    child.radius = radius + (this.width / 10 - radius) * (value);
                } else {
                    child.position = initial.add(dir.multiply(value));
                    child.opacity = 1-value;
                    child.radius = radius * (1-value);
                }
                if (value > t && retract) {
                    t = value;
                    view.opacity = 1-t;
                }
            }, complete);
            child.interpolator.start();
        }
    }

    public round(n: number): number {
        return Math.round(n);
    }

    public groupView(view: NodeView): boolean {
        return view.node === this.current && view.group;
    }
}