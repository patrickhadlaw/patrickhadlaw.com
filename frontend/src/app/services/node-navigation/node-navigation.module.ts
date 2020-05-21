import { NgModule, ModuleWithProviders } from '@angular/core';
import { NavigationNodeConfig, NodeNavigationToken } from '../../model/node-navigation.model';
import { NodeNavigationComponent } from '../../components/node-navigation/node-navigation.component';
import { NodeNavigationService } from './node-navigation.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { DynamicRendererDirective } from '../../directive/dynamic-renderer.directive';

@NgModule({
  declarations: [
    NodeNavigationComponent,
    DynamicRendererDirective
  ],
  imports: [
    CommonModule,
    BrowserModule
  ],
  exports: [NodeNavigationComponent, DynamicRendererDirective]
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
