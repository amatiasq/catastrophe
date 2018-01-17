export default class Color {

    static WHITE = new Color(0xFFFFFFFF);
    static BLACK = new Color(0x000000FF);
    static GRAY = new Color(0x888888FF);
    static RED = new Color(0xFF0000FF);
    static GREEN = new Color(0x00FF00FF);
    static BLUE = new Color(0x0000FFFF);
    static BROWN = new Color(0xA52A2A);

    constructor(public rgba: number) {}

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
