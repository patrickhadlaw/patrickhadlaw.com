import { ModuleWithProviders, InjectionToken, Component, NgModule } from '@angular/core';
import { RouterModule, Routes, ActivatedRouteSnapshot } from '@angular/router';

import { AboutMeComponent } from './components/about-me/about-me.component';

import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';

@Component({
  template: ''
})
class EmptyComponent { }

const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

const appRoutes: Routes = [
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
    path: 'skills',
    component: SkillsComponent,
    pathMatch: 'full'
  }
];

const Router: ModuleWithProviders<RouterModule> = RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' });

@NgModule({
  declarations: [EmptyComponent],
  imports: [Router],
  exports: [RouterModule],
  providers: [
    {
      provide: externalUrlProvider,
      useValue: (route: ActivatedRouteSnapshot) => {
        const externalUrl = route.paramMap.get('externalUrl');
        window.open(externalUrl, '_self');
      },
    },
  ]
})
export class RoutingModule {}
