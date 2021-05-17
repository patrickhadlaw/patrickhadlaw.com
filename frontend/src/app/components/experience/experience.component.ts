import { Component } from '@angular/core';
import { faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss']
})
export class ExperienceComponent {
  readonly RightIcon = faChevronCircleRight;
  readonly LeftIcon = faChevronCircleLeft;
}
