import env from '../env';
import Game from '../game/game';
import Entity from '../game/world/entity';
import Vector from '../geometry/vector';

const game = new Game(
  env,
  document.getElementById('entities') as Canvas,
  document.getElementById('background') as Canvas,
  document.getElementById('foreground') as Canvas,
);

const entitiesCount = env('TEST_ENTITIES');

for (let i = 0; i < entitiesCount; i++) {
  game.addEntity(new Entity(game, Vector.random(game.grid.size.sustractValue(1))));
}

game.start();

export default game;
