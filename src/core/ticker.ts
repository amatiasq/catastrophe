import { bind } from 'bind-decorator';
import { MILLISECONDS_PER_SECOND } from '../constants';

export default class Ticker {

    public isRunning = false;
    private lastFrameTime = 0;

    constructor(
        private readonly ticksPerSecond: number,
        private readonly onTick: OnTickCallback,
    ) {}

    start() {
        this.isRunning = true;
        this.tick();
    }

    stop() {
        this.isRunning = false;
    }

    @bind
    tick() {
        const { ticksPerSecond } = this;
        const now = Date.now();
        const millisecondsPerTick = MILLISECONDS_PER_SECOND / ticksPerSecond;
        let ticks = 1;
        let seconds = 1 / ticksPerSecond;

        if (this.lastFrameTime !== 0) {
            const milliseconds = now - this.lastFrameTime;
            ticks = milliseconds / millisecondsPerTick;
            seconds = milliseconds / MILLISECONDS_PER_SECOND;
        }

        this.onTick(ticks, seconds);

        this.lastFrameTime = now;

        if (this.isRunning) {
            setTimeout(this.tick, millisecondsPerTick);
        }
    }
}

type OnTickCallback = (delta: number, seconds: number) => void;