import Color from '../../geometry/color';
import Sprite from '../sprite';

export default class Entity extends Sprite {

    _render(context: CanvasRenderingContext2D): void {
        context.strokeStyle = Color.GREEN.toString();
        context.arc(16, 16, 16, 0, Math.TAU);
        context.stroke();
    }

}