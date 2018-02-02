import Vector from '../../geometry/vector';
import TileState from './tile-state';

export default class TileView {

    readonly pos = this.size.multiply(this.state);
    readonly end = this.pos.add(this.size);
    readonly center = this.pos.add(this.size.divideValue(2));

    get x() {
        return this.pos.x;
    }

    get y() {
        return this.pos.y;
    }

    get endX() {
        return this.end.x;
    }

    get endY() {
        return this.end.y;
    }

    get width() {
        return this.size.x;
    }

    get height() {
        return this.size.y;
    }

    get centerX() {
        return this.center.x;
    }

    get centerY() {
        return this.center.y;
    }

    constructor(
        private readonly state: TileState,
        private readonly size: Vector,
    ) {}

    render(context: CanvasRenderingContext2D) {
        const { x, y, width, height } = this;

        context.save();
        context.fillStyle = this.state.isWall ? 'white' : 'black';
        context.rect(x, y, width, height);
        context.fill();
        context.restore();
    }

}
