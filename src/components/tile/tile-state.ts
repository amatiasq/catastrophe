import ModelBuffer, { buffer } from '../../core/model-buffer';
import Color from '../../geometry/color';

export default class TileState extends ModelBuffer {

    readonly id: string;
    @buffer readonly x: number;
    @buffer readonly y: number;
    @buffer travelCost = 0.5;
    @buffer hasWall = false;
    @buffer debugColor: Color | null = null;
    @buffer debugContent: string | null = null;

    constructor(x: number, y: number) {
        super();
        this.id = `${x}-${y}`;
        this.x = x;
        this.y = y;
    }
}
