import Color from '../../geometry/color';
import Rectangle from '../../geometry/rectangle';
import Vector from '../../geometry/vector';
import property from '../../meta/property';
import Game from '../game';
import Sprite from '../sprite';
import Entity from './entity';

export default class Tile extends Sprite {

    onChange: () => void;
    entities = new Set<Entity>();
    view: Rectangle;

    @property
    isEnabled = false;

    @property
    isHover = false;

    constructor(
        private game: Game,
        public pos: Vector,
        size: Vector,
    ) {
        super(pos);

        this.view = new Rectangle(pos.multiply(size), size);
    }

    _render(context: Renderer2D): void {
        context.translate(this.view.x, this.view.y);
        this.drawTile(context);
        this.drawEntities(context);
    }

    private drawTile(context: Renderer2D) {
        let color = Color.BLACK;

        if (this.isHover) {
            color = this.isEnabled ? Color.RED : Color.BLUE;
        } else {
            color = this.isEnabled ? Color.WHITE : Color.BLACK;
        }

        context.strokeStyle = Color.GRAY.toString();
        context.fillStyle = color.toString();

        context.beginPath();
        context.rect(0, 0, this.view.width, this.view.height);
        context.fill();
        context.stroke();
        context.closePath();
    }

    private drawEntities(context: Renderer2D) {
        this.entities.forEach(entity => entity.render(context, this.game));
    }

}
