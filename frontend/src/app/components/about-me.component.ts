import { Component, ViewChild, ElementRef } from '@angular/core';
import { ContactMeRequest, SocialLinks } from '../model/api.model';
import { ApiService } from '../services/api/api.service';

enum SendState {
  NotSent = 'not-sent',
  Success = 'success',
  Failure = 'failure'
}

@Component({
  selector: 'app-about-me',
  templateUrl: './about-me.component.html',
  styleUrls: ['./about-me.component.scss']
})
export class AboutMeComponent {
  @ViewChild('messageName') messageName: ElementRef;
  @ViewChild('messageEmail') messageEmail: ElementRef;
  @ViewChild('messageContent') messageContent: ElementRef;

  readonly Email = 'mailto:' + SocialLinks.Email;
  readonly Github = SocialLinks.Github;
  readonly Linkedin = SocialLinks.LinkedIn;

  sendState: SendState = SendState.NotSent;

  constructor(private apiService: ApiService) { }

  sendMessage() {
    this.sendState = SendState.NotSent;
    this.apiService.contactMe(<ContactMeRequest> {
      name: this.messageName.nativeElement.value,
      email: this.messageEmail.nativeElement.value,
      message: this.messageContent.nativeElement.value
    }).subscribe(
      _ => this.sendState = SendState.Success,
      _ => this.sendState = SendState.Failure
    );
  }
}
