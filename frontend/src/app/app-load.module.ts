import { NgModule, InjectionToken, APP_INITIALIZER } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

import { NodeNavigationService, NavigationNode } from './services/node-navigation.service';

export const navigation = {
    name: 'Me',
    route: '/about-me',
    children: [
        {
            name: 'Experience',
            route: '/experience'
        },
        {
            name: 'Skills',
            route: '/skills'
        },
        {
            name: 'Projects',
            children: [
                {
                    name: 'cpp-opengl',
                    route: '/external',
                    extras: { externalUrl: 'https://github.com/patrickhadlaw/cpp-opengl' }
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