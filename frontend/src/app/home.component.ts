import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

export class SocialLinks {
    public static EMAIL = 'patrickhadlaw@gmail.com';
    public static GITHUB = 'https://github.com/patrickhadlaw';
    public static LINKEDIN = 'https://www.linkedin.com/in/patrick-hadlaw-37857810a/';
}

enum SendState {
    NOT_SENT,
    SUCCESS,
    FAILURE
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    @ViewChild('messageName') messageName: any;
    @ViewChild('messageEmail') messageEmail: any;
    @ViewChild('messageContent') messageContent: any;
    
    public email = 'mailto:' + SocialLinks.EMAIL;
    public github = SocialLinks.GITHUB;
    public linkedin = SocialLinks.LINKEDIN;

    sendState: SendState = SendState.NOT_SENT;

    constructor(private router: Router) { }

    sendMessage() {
        // TODO: call api to send message to personal address
        this.sendState = SendState.NOT_SENT;
        this.sendState = SendState.FAILURE;
    }

    sendButtonStyle(): string {
        if (this.sendState == SendState.NOT_SENT) {
            return 'submit-button';
        } else if (this.sendState == SendState.FAILURE) {
            return 'submit-button failure';
        } else {
            return 'submit-button success';
        }
    }
}
