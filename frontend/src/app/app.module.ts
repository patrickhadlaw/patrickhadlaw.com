import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';
import { HttpModule } from '@angular/http';

import { Router, EmptyComponent } from './app.routing';

import { AppComponent } from './components/app.component';
import { ColorBarComponent } from './components/color-bar.component';

import { NodeNavigationComponent } from './components/node-navigation.component';
import { AboutMeComponent } from './components/about-me.component';
import { HeroComponent } from './components/hero.component';
import { BannerComponent } from './components/banner.component';
import { ImageButtonComponent } from './components/image-button.component';

import { VectorAlignCenterDirective } from './directive/align.directive';

import { AppLoadModule } from './app-load.module';

@NgModule({
  declarations: [
    AppComponent,
    EmptyComponent,
    ColorBarComponent,
    AboutMeComponent,
    HeroComponent,
    BannerComponent,
    ImageButtonComponent,
    NodeNavigationComponent,

    VectorAlignCenterDirective
  ],
  imports: [
    AppLoadModule,
    MatButtonModule,
    HttpModule,
    BrowserModule,
    Router
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
