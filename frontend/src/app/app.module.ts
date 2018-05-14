import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';

import { Router } from './app.routing';

import { AppComponent } from './app.component';
import { ColorBarComponent } from './color-bar.component';

import { HomeComponent } from './home.component';
import { HeroComponent } from './hero.component';
import { BannerComponent } from './banner.component';
import { ImageButtonComponent } from './image-button.component';

@NgModule({
  declarations: [
    AppComponent,
    ColorBarComponent,
    HomeComponent,
    HeroComponent,
    BannerComponent,
    ImageButtonComponent
  ],
  imports: [
    MatButtonModule,
    BrowserModule,
    Router
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
