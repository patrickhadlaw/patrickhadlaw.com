import { Component, ViewChild, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
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
    @ViewChild('messageName') messageName: ElementRef;
    @ViewChild('messageEmail') messageEmail: ElementRef;
    @ViewChild('messageContent') messageContent: ElementRef;
    
    public email = 'mailto:' + SocialLinks.EMAIL;
    public github = SocialLinks.GITHUB;
    public linkedin = SocialLinks.LINKEDIN;

    sendState: SendState = SendState.NOT_SENT;

    constructor(private router: Router, private http: Http) { }

    sendMessage() {
        this.sendState = SendState.NOT_SENT;
        if (this.messageName.nativeElement.value
            && this.messageEmail.nativeElement.value
            && this.messageContent.nativeElement.value
        ) {
            this.http.post('/api/message/send', {
                'name': this.messageName.nativeElement.value,
                'email': this.messageEmail.nativeElement.value,
                'message': this.messageContent.nativeElement.value}
            ).subscribe(res => {
                if (res.status === 200) {
                    this.sendState = SendState.SUCCESS;
                } else {
                    this.sendState = SendState.FAILURE;
                }
            });
        } else {
            this.sendState = SendState.FAILURE;
        }
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
