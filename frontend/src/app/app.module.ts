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
import { SkillsComponent } from './components/skills.component';
import { ChipComponent } from './components/chip.component';

import { ScrollXDirective } from './directive/scroll.directive';

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
            description: 'Click here to learn more about my skills',
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
                    name: 'cpp-vulkan',
                    description: 'A Vulkan API project',
                    route: '/external',
                    extras: { externalUrl: 'https://github.com/patrickhadlaw/cpp-vulkan' }
                },
                {
                    name: 'The-Brachistochrone-Curve',
                    description: 'A web app/game relating to the brachistochrone curve',
                    route: '/external',
                    extras: { externalUrl: 'https://github.com/patrickhadlaw/The-Brachistochrone-Curve' }
                },
                {
                    name: 'py-mod-sort',
                    description: 'Sorting algorithm visualization',
                    route: '/external',
                    extras: { externalUrl: 'https://github.com/patrickhadlaw/py-mod-sort' }
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
        ChipComponent,
        ColorBarComponent,
        AboutMeComponent,
        ExperienceComponent,
        SkillsComponent,
        HeroComponent,
        BannerComponent,
        ImageButtonComponent,
        NodeNavigationComponent,
    
        ScrollXDirective
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