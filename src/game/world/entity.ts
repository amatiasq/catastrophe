import Color from '../../geometry/color';
import Sprite from '../sprite';
import Renderer from '../renderer';
import Vector from '../../geometry/vector';
import Game from '../game';

const SINGLE_TILE = Vector.of(1, 1);

export default class Entity extends Sprite {

    constructor(pos: Vector, size = SINGLE_TILE) {
        super(pos, size);
    }

    _render(context: CanvasRenderingContext2D, renderer: Renderer, game: Game): void {
        const center = game.tileSize.divideValue(2);

        context.strokeStyle = Color.GREEN.toString();
        context.arc(center.x, center.y, Math.min(center.x, center.y) - 2, 0, Math.TAU);
        context.stroke();
    }

}
