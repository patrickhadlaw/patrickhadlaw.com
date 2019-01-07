import { NgModule, InjectionToken, APP_INITIALIZER } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

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

export const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

@NgModule({
    imports: [],
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
    ]
})
export class AppLoadModule { }