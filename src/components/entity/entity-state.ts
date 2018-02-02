import ModelBuffer, { buffer } from '../../core/model-buffer';
import { Coords } from '../../core/types';

export default class EntityState extends ModelBuffer {
    @buffer x: number = 0;
    @buffer y: number = 0;
    @buffer step: number = 0;
    @buffer path: Coords[] | null = null;
}
