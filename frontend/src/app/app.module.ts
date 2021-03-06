import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RoutingModule } from './routing.module';
import { AppComponent } from './components/app/app.component';
import { ColorBarComponent } from './components/color-bar/color-bar.component';
import { AboutMeComponent } from './components/about-me/about-me.component';
import { HeroComponent } from './components/hero/hero.component';
import { BannerComponent } from './components/banner/banner.component';
import { ImageButtonComponent } from './components/image-button/image-button.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ChipComponent } from './components/chip/chip.component';
import { ScrollXDirective } from './directive/scroll.directive';
import { NodeNavigationService } from './services/node-navigation/node-navigation.service';
import { NodeNavigationModule } from './services/node-navigation/node-navigation.module';
import { navigation } from './model/node-navigation.model';
import { ApiService } from './services/api/api.service';
import { ShelfComponent } from './components/shelf/shelf.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
    ScrollXDirective,
    ShelfComponent
  ],
  imports: [
    MatButtonModule,
    HttpClientModule,
    BrowserModule,
    RoutingModule,
    FontAwesomeModule,
    NodeNavigationModule.forRoot(navigation)
  ],
  providers: [
    ApiService
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
