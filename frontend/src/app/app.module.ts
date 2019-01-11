import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { MatButtonModule } from '@angular/material';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { EmptyComponent } from './app.routing';

import { AppComponent } from './components/app.component';
import { ColorBarComponent } from './components/color-bar.component';

import { NodeNavigationComponent } from './components/node-navigation.component';
import { AboutMeComponent } from './components/about-me.component';
import { HeroComponent } from './components/hero.component';
import { BannerComponent } from './components/banner.component';
import { ImageButtonComponent } from './components/image-button.component';
import { ExperienceComponent } from './components/experience.component';

import { VectorTextFitWidthDirective } from './directive/align.directive';

import { externalUrlProvider, Router } from './app.routing';

import { NodeNavigationService, NavigationNode } from './services/node-navigation.service';

export const navigation = {
    name: 'Me',
    description: 'Click here to learn more about me or to contact me!',
    route: '/about-me',
    children: [
        {
            name: 'Experience',
            description: 'Click here to learn more about my work experience',
            route: '/experience'
        },
        {
            name: 'Skills',
            description: 'Click here to learn more about my various skills',
            route: '/skills'
        },
        {
            name: 'Projects',
            description: 'Click here to see some of my side projects on Github',
            children: [
                {
                    name: 'cpp-opengl',
                    description: 'A real-time GUI and 3D renderer',
                    route: '/external',
                    extras: { externalUrl: 'https://github.com/patrickhadlaw/cpp-opengl' }
                },
                {
                    name: 'patrickhadlaw.com',
                    description: 'This website',
                    route: '/external',
                    extras: { externalUrl: 'https://github.com/patrickhadlaw/patrickhadlaw.com' }
                }
            ]
        }
    ]
};

export function appInit(service: NodeNavigationService) {
    return () => {
        service.set(NavigationNode.fromJSON(navigation));
    }
}

@NgModule({
    declarations: [
        AppComponent,
        EmptyComponent,
        ColorBarComponent,
        AboutMeComponent,
        ExperienceComponent,
        HeroComponent,
        BannerComponent,
        ImageButtonComponent,
        NodeNavigationComponent,
    
        VectorTextFitWidthDirective
      ],
    imports: [
        Router,
        MatButtonModule,
        HttpModule,
        BrowserModule
    ],
    providers: [
        NodeNavigationService,
        { provide: APP_INITIALIZER, useFactory: appInit, deps: [NodeNavigationService], multi: true },
        {
            provide: externalUrlProvider,
            useValue: (route: ActivatedRouteSnapshot) => {
                const externalUrl = route.paramMap.get('externalUrl');
                window.open(externalUrl, '_self');
            },
        },
    ],
    bootstrap: [AppComponent]

})
export class AppModule { }