import Rectangle from '../geometry/rectangle';
import Renderer from './renderer';

export default abstract class Sprite extends Rectangle {

    protected dirty = true;

    render(context: Renderer2D, renderer: Renderer) {
        // if (!this.dirty) {
        //     return;
        // }

        context.save();
        context.translate(this.x, this.y);

        this._render(context);

        context.restore();
        // this.dirty = false;
    }

    abstract _render(context: Renderer2D, renderer?: Renderer): void;
}