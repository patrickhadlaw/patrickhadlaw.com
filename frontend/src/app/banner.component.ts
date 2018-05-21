import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
    @Input('backgroundColor') backgroundColor = 'rgb(240, 240, 240)';
    @Input('color') color = 'rgb(50, 50, 50)';

    constructor() { }
}
