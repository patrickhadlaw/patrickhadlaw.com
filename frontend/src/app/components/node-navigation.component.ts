import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { appRoutes } from '../app.routing';
import { NodeNavigationService, NavigationNode } from '../services/node-navigation.service';
import { Router } from '@angular/router';

import { Interpolator, ContinuousBezierInterpolator, BezierInterpolator, ContinuousInterpolator } from '../animate';
import { rotatePoint, Vector } from '../vector';
import { doesNotThrow } from 'assert';
import { BezierCurve } from '../bezier';

const ANIMATION_TIME = 10000;

class NodeView {
    constructor() {
        this.position = new Vector(0, 0);
    }
    public title: string;
    public description: string;
    public position: Vector;
    public radius: number;
    public interpolator: Interpolator;
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
export class NodeNavigationComponent implements OnInit {
    @ViewChild('root') svgElement: ElementRef;
    @ViewChild('nodes') nodesElement: ElementRef;

    @Input('bubble-fill') bubbleFill: string = '#ffffff';
    @Input('bubble-stroke') bubbleStroke: string = '#004466';

    current: NavigationNode;
    clipPath: string = '';
    width: number = 0;
    height: number = 0;
    pull: number = 50;

    nodeViews: NodeView[] = [];
    nodeLines: NodeLine[] = [];
    backgroundViews: NodeView[] = [];
    backgroundLines: NodeLine[] = [];

    constructor(private navigationService: NodeNavigationService, private router: Router) {}

    ngOnInit() {
        this.width = this.svgElement.nativeElement.clientWidth;
        this.height = this.svgElement.nativeElement.clientHeight;
        this.navigationService.observe().subscribe((node) => {
            this.update(node);
        });
    }

    public update(node: NavigationNode) {
        this.current = node;
        let bbox = this.svgElement.nativeElement.getBBox();
        this.createNodes(node, new Vector(bbox.width / 2, bbox.height / 2), 100);
        console.log(this.nodeViews);
        this.createBackground();
    }

    public createNodes(node: NavigationNode, center: Vector, radius: number = 50) {
        let view = new NodeView();
        view.position.x = center.x;
        view.position.y = center.y;
        view.radius = radius;
        view.title = node.name;
        this.nodeViews.push(view);
        // let angle = Math.atan(center.y / center.x);
        // if (center.x < 0.0 && center.y > 0.0) {
        //     angle = 180 - angle;
        // } else if (center.x < 0.0 && center.y < 0.0) {
        //     angle = 180 + angle;
        // } else if (center.x > 0.0 && center.y < 0.0) {
        //     angle = 360 - angle;
        // }

        let offset = new Vector(0, 3 * radius);
        const deltaTheta = (2 * Math.PI) / node.children.length;
        console.log(deltaTheta);
        
        for (let child of node.children) {
            let point = center.add(offset);
            this.createNodes(child, point, radius / 2);
            offset = rotatePoint(offset, deltaTheta);
        }
    }

    public randomCurve(start: Vector): BezierCurve {
        let controls = [new Vector(...start.data)];
        let first = new Vector(
            Math.floor(Math.random() * this.width * 2) - this.width / 2,
            Math.floor(Math.random() * this.height * 2) - this.height / 2);
        controls.push(first);
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
            controls.push(new Vector(
                Math.floor(Math.random() * this.width * 2) - this.width / 2,
                Math.floor(Math.random() * this.height * 2) - this.height / 2)
            );
        }
        let change = first.subtract(start);
        controls.push(start.add(change.negate()));
        controls.push(start);
        return new BezierCurve(...controls);
    }
    public extendCurve(start: Vector, tangent: Vector): BezierCurve {
        let first = new Vector(...start.data);
        let controls = [first, first.add(tangent.unit().multiply(10))];
        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
            controls.push(new Vector(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height)));
        }
        return new BezierCurve(...controls);
    }

    public createBackground(nodes: number = 50) {
        for (let i = 0; i < nodes; i++) {
            let node = new NodeView();
            node.radius = Math.floor(Math.random() * 8) + 2;
            node.position.x = Math.floor(Math.random() * this.width);
            node.position.y = Math.floor(Math.random() * this.height);
            node.interpolator = new ContinuousBezierInterpolator(Math.floor(ANIMATION_TIME * (Math.random() + 1)), this.randomCurve(node.position),
                (point: Vector, t: number) => {
                    node.position = point;
                }
            );
            this.backgroundViews.push(node);
            node.interpolator.start();
        }
        for (let i = 1; i < this.backgroundViews.length; i++) {
            let line = new NodeLine();
            line.view1 = this.backgroundViews[i-1];
            line.view2 = this.backgroundViews[i];
            this.backgroundLines.push(line);
        }
    }

    public expand() {
        this.router.navigateByUrl(this.current.route, this.current.extras);
    }
}