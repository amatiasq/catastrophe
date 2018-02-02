import StageState from '../components/stage/stage-state';
import StageView from '../components/stage/stage-view';
import MessageType from '../core/message-type';
import WorkerMessaging from '../core/worker-messaging';
import env from '../env';
import Vector from '../geometry/vector';
import WorkerEntity from '../index.worker';

const state = new StageState();
const worker = new WorkerMessaging<MessageType>(new (WorkerEntity as any)());
const stage = new StageView(state, env, message, Vector.of(env('TILE_SIZE'), env('TILE_SIZE')));

worker.addHandler(MessageType.BASIC, payload => console.log('MAIN', payload));

// import Game from '../game/game';
// import Entity from '../game/world/entity';
// import Vector from '../geometry/vector';

// const game = new Game(
//   env,
//   document.getElementById('entities') as Canvas,
//   document.getElementById('background') as Canvas,
//   document.getElementById('foreground') as Canvas,
// );

// const entitiesCount = env('TEST_ENTITIES');

// for (let i = 0; i < entitiesCount; i++) {
//   game.addEntity(new Entity(game, Vector.random(game.grid.size.sustractValue(1))));
// }

// game.start();

// export default game;
