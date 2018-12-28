import { Component, ViewChild, ElementRef, OnInit, Input, AfterViewInit } from '@angular/core';
import { appRoutes } from '../app.routing';
import { NodeNavigationService, NavigationNode } from '../services/node-navigation.service';
import { Router } from '@angular/router';

import { Interpolator, ContinuousBezierInterpolator, BezierInterpolator, ContinuousInterpolator, ANIMATION_PERIOD, LinearInterpolator } from '../animate';
import { rotatePoint, Vector } from '../vector';
import { doesNotThrow } from 'assert';
import { BezierCurve } from '../bezier';

const ANIMATION_TIME = 60000;

class NodeView {
    constructor() {
        this.position = new Vector(0, 0);
        this.opacity = 1.0;
        this.scale = 1.0;
    }
    public title: string;
    public description: string;
    public position: Vector;
    public radius: number;
    public scale: number;
    public path: BezierCurve;
    public time: number;
    public node: NavigationNode;
    public interpolator: Interpolator;
    public opacity: number;
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

    current: NavigationNode;
    clipPath: string = '';
    width: number = 0;
    height: number = 0;
    pull: number = 50;

    active: boolean = true;

    maskPosition: Vector = new Vector(0, 0);
    maskRadius: number = 0;
    maskOpacity: number = 1.0;

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
        this.navigationService.observe().subscribe((node) => {
            this.update(node);
        });
        window.addEventListener('resize', this.onResize);
    }

    public update(node: NavigationNode) {
        this.current = node;
        let bbox = this.svgElement.nativeElement.getBBox();
        this.createNodes(node, new Vector(bbox.width / 2, bbox.height / 2), 100);
        console.log(this.nodeViews);
        this.createBackground();
    }

    public onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    public createNodes(node: NavigationNode, center: Vector, radius: number = 50, level: number = 0) {
        let view = new NodeView();
        view.position.x = center.x;
        view.position.y = center.y;
        view.radius = radius;
        view.title = node.name;
        view.time = Math.floor(ANIMATION_TIME * (Math.random() + 1));
        view.node = node;
        let curve = this.randomCurveInRange(view.position,
            new Vector(radius, radius),
            new Vector(this.width - radius, this.height - radius)
        );
        view.interpolator = new ContinuousBezierInterpolator(view.time, curve,
            (point: Vector, t: number) => {
                view.position = point;
            }
        );
        this.nodeViews.push(view);
        view.interpolator.start();

        let offset = new Vector(0, 3 * radius);
        const deltaTheta = (2 * Math.PI) / node.children.length;

        if (level === 0) {
            for (let child of node.children) {
                let point = center.add(offset);
                let childView = this.createNodes(child, point, radius / 2, level + 1);
                offset = rotatePoint(offset, deltaTheta);
                let line = new NodeLine();
                line.view1 = view;
                line.view2 = childView;
                this.backgroundLines.push(line);
            }
        }
        return view;
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
        // for (let i = 1; i < this.backgroundViews.length; i++) {
        //     let line = new NodeLine();
        //     line.view1 = this.backgroundViews[i-1];
        //     line.view2 = this.backgroundViews[i];
        //     this.backgroundLines.push(line);
        // }
    }

    public clickNode(view: NodeView) {
        this.current = view.node;
        if (this.current.isRouted()) {
            this.expandPage(view);
        } else {
            this.expandGroup(view);
        }
    }

    public expandPage(view: NodeView) {
        this.router.navigateByUrl(this.current.route, this.current.extras);
        this.maskPosition.x = view.position.x;
        this.maskPosition.y = view.position.y;
        this.maskRadius = 0;
        this.maskOpacity = 1.0;
        this.expander = new LinearInterpolator(1000, (value: number) => {
            this.maskRadius = value * Math.max(this.width, this.height);
            this.maskOpacity = 1 - value;
        }, () => { this.active = false;this.router.navigateByUrl(this.current.route, this.current.extras); });
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
        this.maskPosition.x = find.position.x;
        this.maskPosition.y = find.position.y;
        this.maskRadius = Math.max(this.width, this.height);
        this.maskOpacity = 0.0;
        this.active = true;
        this.expander = new LinearInterpolator(1000, (value: number) => {
            this.maskRadius = (1 - value) * Math.max(this.width, this.height);
            this.maskOpacity = value;
        }, () => { this.router.navigateByUrl('/') });
        this.expander.start();
    }

    public expandGroup(view: NodeView) {
        for (let child of this.nodeViews) {
            if (child === view) {
                child.interpolator.stop();
                let initial = new Vector(...child.position.data);
                let dir = new Vector(this.width / 2 - child.position.x, this.height / 2 - child.position.y);
                child.interpolator = new LinearInterpolator(500, (value: number) => {
                    child.position = initial.add(dir.unit().multiply(value));
                }, () => {});
            } else {
                child.interpolator.stop();
                let initial = new Vector(...child.position.data);
                child.interpolator = new LinearInterpolator(500, (value: number) => {
                    let dir = new Vector(view.position.x - child.position.x, view.position.y - child.position.y);
                    child.position = initial.add(dir.unit().multiply(value));
                }, () => {
                    let index = this.nodeViews.indexOf(child);
                    this.nodeViews.splice(index, 1);
                });
            }
        }
        // TODO: create and extend new children
    }
}