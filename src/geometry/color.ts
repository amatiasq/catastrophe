export default class Color {

    static WHITE = new Color(0xFFFFFFFF);
    static BLACK = new Color(0x000000FF);
    static GRAY = new Color(0x888888FF);
    static RED = new Color(0xFF0000FF);
    static GREEN = new Color(0x00FF00FF);
    static BLUE = new Color(0x0000FFFF);
    static BROWN = new Color(0xA52A2AFF);
    static LIGHT_GREEN = new Color(0x98fb98FF);

    constructor(public rgba: number) {}

    opacity(value: number): Color {
        const transparent = this.rgba && 0xFFFFFF00;
        return new Color(transparent + Math.round(value * 0xFF));
    }

    red(value: number): Color {
        const base = this.rgba && 0x00FFFFFF;
        return new Color(base + value * 0x01000000);
    }

    green(value: number): Color {
        const base = this.rgba && 0xFF00FFFF;
        return new Color(base + value * 0x00010000);
    }

    blue(value: number): Color {
        const base = this.rgba && 0xFFFF00FF;
        return new Color(base + value * 0x00000100);
    }

    toString() {
        return `#${padLeft(this.rgba.toString(16), 8, '0')}`;
    }
}

function padLeft(text: string, amount: number, value: string) {
    while (text.length < amount) {
        text = value + text;
    }
    return text;
}
