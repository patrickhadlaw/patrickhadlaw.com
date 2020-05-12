export class Color {
  r = 0;
  g = 0;
  b = 0;
  a = 1;
  constructor(r?, g: number = 0, b: number = 0, a: number = 1) {
    if (typeof r === 'string' && r[0] === '#') {
      if (r.length === 7 || r.length === 9) {
        this.r = parseInt(r[1] + r[2], 16);
        this.g = parseInt(r[3] + r[4], 16);
        this.b = parseInt(r[5] + r[6], 16);
        if (r.length === 9) {
          this.a = parseInt(r[7] + r[8], 16);
        }
      } else if (r.length === 4 || r.length === 5) {
        this.r = parseInt(r[1] + r[1], 16);
        this.g = parseInt(r[2] + r[2], 16);
        this.b = parseInt(r[3] + r[3], 16);
        if (r.length === 5) {
          this.a = parseInt(r[4] + r[4], 16);
        }
      } else {
        console.log('Warning: invalid usage of Color()');
      }
    } else if (typeof r === 'number') {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    } else {
      console.log('Warning: invalid usage of Color()');
    }
  }
  static mixHex(s1: string, s2: string, percent: number = 0.5): string {
    const c1 = new Color(s1);
    const c2 = new Color(s2);
    return Color.mix(c1, c2, percent).toHexString();
  }
  static mix(c1: Color, c2: Color, percent: number = 0.5): Color {
    c1.percentTo(c2, percent);
    return c1;
  }
  static random(): Color {
    return new Color(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
  }
  static darken(color: Color, percent: number): Color {
    color.darkenBy(percent);
    return color;
  }
  static darkenHex(hex: string, percent: number): string {
    const color = new Color(hex);
    color.darkenBy(percent);
    return color.toHexString();
  }
  static lighten(color: Color, percent: number): Color {
    color.lightenBy(percent);
    return color;
  }
  static lightenHex(hex: string, percent: number): string {
    const color = new Color(hex);
    color.lightenBy(percent);
    return color.toHexString();
  }
  lightenBy(percent: number) {
    this.r = Math.round(((1 + percent) * this.r) % 255);
    this.g = Math.round(((1 + percent) * this.g) % 255);
    this.b = Math.round(((1 + percent) * this.b) % 255);
  }
  darkenBy(percent: number) {
    this.r = Math.round((1 - percent) * this.r);
    this.g = Math.round((1 - percent) * this.g);
    this.b = Math.round((1 - percent) * this.b);
  }
  percentTo(other: Color, percent: number) {
    this.r = Math.round((1 - percent) * this.r + percent * other.r);
    this.g = Math.round((1 - percent) * this.g + percent * other.g);
    this.b = Math.round((1 - percent) * this.b + percent * other.b);
    this.a = (1 - percent) * this.a + percent * other.a;
  }
  toRGBString(): string {
    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
  }
  toRGBAString(): string {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
  }
  toHexString(): string {
    const hr = this.r.toString(16);
    const hg = this.g.toString(16);
    const hb = this.b.toString(16);
    const ha = this.a.toString(16);
    if (this.a === 1) {
      return `#${hr.length === 1 ? '0' + hr : hr}${hg.length === 1 ? '0' + hg : hg}${hb.length === 1 ? '0' + hb : hb}`;
    } else {
      return `#${hr.length === 1 ? '0' + hr : hr}${hg.length === 1 ? '0' + hg : hg}${hb.length === 1 ? '0' + hb : hb}` +
        `${ha.length === 1 ? '0' + ha : ha}`;
    }
  }
}
