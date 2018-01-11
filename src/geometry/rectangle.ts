import Vector from './vector';

export default class Rectangle {

    get x() {
        return this.pos.x;
    }
    set x(value: number) {
        this.pos = Vector.of(value, this.pos.y);
    }

    get y() {
        return this.pos.y;
    }
    set y(value: number) {
        this.pos = Vector.of(this.pos.x, value);
    }

    get endX() {
        return this.pos.x + this.size.x;
    }
    set endX(value: number) {
        this.pos = Vector.of(value - this.size.x, this.pos.y);
    }

    get endY() {
        return this.pos.y + this.size.y;
    }
    set endY(value: number) {
        this.pos = Vector.of(this.pos.x, value - this.size.y);
    }

    get width() {
        return this.size.x;
    }
    set width(value: number) {
        this.size = Vector.of(value, this.size.y);
        this.fixCoords();
    }

    get height() {
        return this.size.y;
    }
    set height(value: number) {
        this.size = Vector.of(this.size.x, value);
        this.fixCoords();
    }

    get end() {
        return Vector.of(this.endX, this.endY);
    }

    constructor(
        public pos: Vector,
        public size: Vector,
    ) {
        this.fixCoords();
    }

    contains(point: Vector) {
        const { x: px, y: py } = point;
        const { x, y, endX, endY } = this;
        return px > x && px < endX && py > y && py < endY;
    }

    toString() {
        return `[Rectangle(${this.x}, ${this.y}, ${this.width}, ${this.height})]`;
    }

    private fixCoords() {
        if (this.width < 0) {
            this.width = -this.width;
            this.x = this.x - this.width;
        }

        if (this.height < 0) {
            this.height = -this.height;
            this.y = this.y - this.height;
        }
    }
}
