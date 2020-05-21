import { Directive, Input, Type, ViewContainerRef, ComponentFactoryResolver, OnInit, ComponentRef } from '@angular/core';

@Directive({
  selector: '[appDynamicRenderer]'
})
export class DynamicRendererDirective implements OnInit {
  @Input('appDynamicRenderer') type: Type<any>;

  private _component: ComponentRef<any>;

  public get instance(): any {
    return this._component.instance;
  }

  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(this.type);
    this._component = this.viewContainerRef.createComponent(factory);
  }

}
