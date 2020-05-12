import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RoutingModule } from './routing.module';
import { AppComponent } from './components/app.component';
import { ColorBarComponent } from './components/color-bar.component';
import { AboutMeComponent } from './components/about-me.component';
import { HeroComponent } from './components/hero.component';
import { BannerComponent } from './components/banner.component';
import { ImageButtonComponent } from './components/image-button.component';
import { ExperienceComponent } from './components/experience.component';
import { SkillsComponent } from './components/skills.component';
import { ChipComponent } from './components/chip.component';
import { ScrollXDirective } from './directive/scroll.directive';
import { NodeNavigationService } from './services/node-navigation/node-navigation.service';
import { NodeNavigationModule } from './services/node-navigation/node-navigation.module';
import { navigation } from './model/node-navigation.model';
import { ApiService } from './services/api/api.service';

@NgModule({
  declarations: [
    AppComponent,
    ChipComponent,
    ColorBarComponent,
    AboutMeComponent,
    ExperienceComponent,
    SkillsComponent,
    HeroComponent,
    BannerComponent,
    ImageButtonComponent,
    ScrollXDirective
  ],
  imports: [
    MatButtonModule,
    HttpClientModule,
    BrowserModule,
    RoutingModule,
    NodeNavigationModule.forRoot(navigation)
  ],
  providers: [
    ApiService
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
