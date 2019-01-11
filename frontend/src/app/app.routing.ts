import { ModuleWithProviders, InjectionToken, Component } from '@angular/core'; 
import { RouterModule, Routes } from '@angular/router';

import { AboutMeComponent } from './components/about-me.component';
import { AppComponent } from './components/app.component';
import { NodeNavigationComponent } from './components/node-navigation.component';

import { ExperienceComponent } from './components/experience.component';

@Component({
    template: ''
})
export class EmptyComponent {}

export const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

export const appRoutes: Routes = [
    {
        path: 'external',
        canActivate: [externalUrlProvider],
        component: EmptyComponent
    },
    {
        path: '',
        component: EmptyComponent,
        pathMatch: 'full'
    },
    {
        path: 'about-me',
        component: AboutMeComponent,
        pathMatch: 'full'
    },
    {
        path: 'experience',
        component: ExperienceComponent,
        pathMatch: 'full'
    },
    {
        path: 'cpp-opengl',
        
        component: EmptyComponent,
        pathMatch: 'full'
    }
];

export const Router: ModuleWithProviders = RouterModule.forRoot(appRoutes);