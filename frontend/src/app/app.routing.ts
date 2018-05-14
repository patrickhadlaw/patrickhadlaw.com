import { ModuleWithProviders } from '@angular/core'; 
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home.component';

const appRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    }
];

export const Router: ModuleWithProviders = RouterModule.forRoot(appRoutes);