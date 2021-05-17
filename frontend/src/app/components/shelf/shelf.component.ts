import { Component, Input, OnInit } from '@angular/core';
import { faChevronCircleRight, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-shelf',
  templateUrl: './shelf.component.html',
  styleUrls: ['./shelf.component.scss']
})
export class ShelfComponent implements OnInit {

  inactiveIcon = faChevronCircleRight;
  activeIcon = faChevronCircleDown;

  @Input() title = '';
  @Input() active = false;

  constructor() { }

  ngOnInit(): void {}

  /**
   * Toggles the shelf
   */
  public toggle() {
    this.active = !this.active;
  }

}
