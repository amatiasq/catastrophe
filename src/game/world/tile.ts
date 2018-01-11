import Color from '../../geometry/color';
import Vector from '../../geometry/vector';
import property from '../../meta/property';
import Sprite from '../sprite';

export default class Tile extends Sprite {

    onChange: () => void;

    @property
    isEnabled = true;

    @property
    isHover = false;

    constructor(
        pos: Vector,
        size: Vector,
        public coords: Vector
    ) {
        super(pos, size);
    }

    _render(context: Renderer2D): void {
        let color = Color.BLACK;

        if (this.isHover) {
            color = this.isEnabled ? Color.RED : Color.BLUE;
        } else {
            color = this.isEnabled ? Color.WHITE : Color.BLACK;
        }

        context.strokeStyle = Color.GRAY.toString();
        context.fillStyle = color.toString();

        context.beginPath();
        context.rect(0, 0, this.width, this.height);
        context.fill();
        context.stroke();
        context.closePath();
    }
}
