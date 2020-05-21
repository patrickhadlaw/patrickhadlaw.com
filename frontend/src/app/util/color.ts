/**
 * Stores an rgba color
 */
export class Color {
  r = 0;
  g = 0;
  b = 0;
  a = 1;

  constructor(r: string | number, g: number = 0, b: number = 0, a: number = 1) {
    if (typeof r === 'string') {
      if (r[0] === '#') {
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
          throw new Error(`invalid color string: ${r}`);
        }
      } else {
        throw new Error(`invalid color string: ${r}`);
      }
    } else {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
  }

  /**
   * Makes the color black
   * @returns the color black
   */
  static black(): Color {
    return new Color(0, 0, 0);
  }

  /**
   * Makes the color gray
   * @returns the color gray
   */
  static gray(): Color {
    return new Color(128, 128, 128);
  }

  /**
   * Makes the color white
   * @returns the color white
   */
  static white(): Color {
    return new Color(255, 255, 255);
  }

  /**
   * Mixes two hex colors by a certain percent
   * @param hex1 the first hex color
   * @param hex2 the second hex color
   * @returns the resulting hex color
   */
  static mixHex(hex1: string, hex2: string, percent: number = 0.5): string {
    const c1 = new Color(hex1);
    const c2 = new Color(hex2);
    return Color.mix(c1, c2, percent).toHexString();
  }

  /**
   * Mixes two colors by a certain percent
   * @param c1 the first color
   * @param c2 the second color
   * @returns the resulting color
   */
  static mix(c1: Color, c2: Color, percent: number = 0.5): Color {
    c1.percentTo(c2, percent);
    return c1;
  }

  /**
   * Generates a random color
   * @returns a random color
   */
  static random(): Color {
    return new Color(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
  }

  /**
   * Darkens a color by a certain percent
   * @param color the color to lighten
   * @param percent the percent to darken by
   * @returns the darkened color
   */
  static darken(color: Color, percent: number): Color {
    color.darkenBy(percent);
    return color;
  }

  /**
   * Darkens a hex color by a certain percent
   * @param hex the color to lighten
   * @param percent the percent to darken by
   * @returns the darkened hex color
   */
  static darkenHex(hex: string, percent: number): string {
    const color = new Color(hex);
    color.darkenBy(percent);
    return color.toHexString();
  }

  /**
   * Lightens a color by a certain percent
   * @param color the color to lighten
   * @param percent the percent to lighten by
   * @returns the lightened color
   */
  static lighten(color: Color, percent: number): Color {
    color.lightenBy(percent);
    return color;
  }

  /**
   * Lightens a hex color by a certain percent
   * @param hex the color to lighten
   * @param percent the percent to lighten by
   * @returns the lightened hex color
   */
  static lightenHex(hex: string, percent: number): string {
    const color = new Color(hex);
    color.lightenBy(percent);
    return color.toHexString();
  }

  /**
   * Fades a color to a certain opacity
   * @param opacity the opacity to set
   * @returns the faded color
   */
  fade(opacity: number): Color {
    return new Color(this.r, this.g, this.b, opacity);
  }

  /**
   * Lightens the color by a given percent
   * @param percent the percent to lighten by
   */
  lightenBy(percent: number) {
    this.r = Math.round(((1 + percent) * this.r) % 255);
    this.g = Math.round(((1 + percent) * this.g) % 255);
    this.b = Math.round(((1 + percent) * this.b) % 255);
  }

  /**
   * Darkens the color by a given percent
   * @param percent the percent to darken by
   */
  darkenBy(percent: number) {
    this.r = Math.round((1 - percent) * this.r);
    this.g = Math.round((1 - percent) * this.g);
    this.b = Math.round((1 - percent) * this.b);
  }

  /**
   * Blends another color into the current one
   * @param other the color to blend from
   * @param percent the percent to blend
   */
  percentTo(other: Color, percent: number) {
    this.r = Math.round((1 - percent) * this.r + percent * other.r);
    this.g = Math.round((1 - percent) * this.g + percent * other.g);
    this.b = Math.round((1 - percent) * this.b + percent * other.b);
    this.a = (1 - percent) * this.a + percent * other.a;
  }

  /**
   * Write the color as an RGB string
   * @returns rgb string
   */
  toRGBString(): string {
    return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
  }

  /**
   * Write the color as an RGBA string
   * @returns rgba string
   */
  toRGBAString(): string {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
  }

  /**
   * Write the color as a hex string
   * @returns hex string
   */
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
