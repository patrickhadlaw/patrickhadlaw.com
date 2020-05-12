import { NgModule, ModuleWithProviders } from '@angular/core';
import { NavigationNodeConfig, NodeNavigationToken } from '../../model/node-navigation.model';
import { NodeNavigationComponent } from '../../components/node-navigation.component';
import { NodeNavigationService } from './node-navigation.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [NodeNavigationComponent],
  imports: [
    CommonModule,
    BrowserModule
  ],
  exports: [NodeNavigationComponent]
})
export class NodeNavigationModule {
  static forRoot(config: NavigationNodeConfig): ModuleWithProviders {
    return {
      ngModule: NodeNavigationModule,
      providers: [
        NodeNavigationService,
        { provide: NodeNavigationToken, useValue: config }
      ]
    };
  }
}
