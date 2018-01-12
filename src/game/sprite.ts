import Vector from '../geometry/vector';
import Game from './game';

export default abstract class Sprite {

    protected dirty = true;

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

    constructor(
        public pos: Vector,
    ) {}

    render(context: Renderer2D, game: Game) {
        // if (!this.dirty) {
        //     return;
        // }

        context.save();
        this._render(context, game);
        context.restore();
        // this.dirty = false;
    }

    abstract _render(context: Renderer2D, game?: Game): void;
}