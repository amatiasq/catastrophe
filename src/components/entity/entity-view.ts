import { DEBUG_PATHFINDING_ROUTES } from '../../constants';
import Color from '../../geometry/color';
import { TAU } from '../../geometry/math';
import Vector from '../../geometry/vector';
import StageView from '../stage/stage-view';
import EntityState from './entity-state';

export default class EntityView {

    get tile() {
        return this.stage.getTile(this.state);
    }

    constructor(
        private readonly stage: StageView,
        private readonly state: EntityState,
        private readonly size: number,
    ) {}

    render(context: Renderer2D): void {
        const { step, path } = this.state;

        if (path && DEBUG_PATHFINDING_ROUTES) {
            const [first, ...remaining ] = path
                .slice(step - 1)
                .map(tile => this.stage.getTile(tile));

            context.save();
            context.strokeStyle = Color.WHITE.opacity(0.8).toString();
            context.beginPath();
            context.moveTo(first.x, first.y);
            remaining.forEach((entry) => context.lineTo(entry.x, entry.y));
            context.stroke();
            context.closePath();
            context.restore();
        }

        const { centerX, centerY } = this.tile;

        context.beginPath();
        context.fillStyle = Color.GREEN.toString();
        context.strokeStyle = Color.GREEN.toString();
        context.arc(centerX, centerY, this.size / 2, 0, TAU);
        context.fill();
        context.stroke();
        context.closePath();
    }

}
