import Discrete from '../spaces/Discrete';
import TetrisRenderer from './TetrisRenderer';
import { cloneMatrix, deepCopy, step } from '../util';
import { createMatrix, collide, merge,
  randPiece, rot, sweep } from './tetrisUtil';

const WIN_REQ = 100;

const addPiece = (arena, player, hold) => {
  sweep(arena, player);
  player.matrix = randPiece();
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0);
  const done = collide(arena, player) || player.score >= WIN_REQ;
  return {arena, player, hold, done};
};

const moveHorizontal = (arena, player, hold, dir) => {
  player.pos.x = player.pos.x + dir;
  if (collide(arena, player)) {
    player.pos.x = player.pos.x + (dir * -1);
  }
  return moveDown(arena, player, hold);
};

const drop = (arena, player, hold) => {
  while (!collide(arena, player)) {
    ++player.pos.y;
  }
  --player.pos.y;
  return moveDown(arena, player, hold);
};

const rotate = (arena, player, hold, dir) => {
  const pos = player.pos.x;
  let offset = 1;
  player.matrix = rot(player.matrix, dir);
  while(collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      player.matrix = rot(player.matrix, dir * -1);
      player.pos.x = pos;
      return moveDown(arena, player, hold);
    }
  }
  return moveDown(arena, player, hold);
};

const swap = (arena, player, hold) => {
  [player.matrix, hold] = [hold, player.matrix];
  if (collide(arena, player)) {
    [player.matrix, hold] = [hold, player.matrix];
  }
  return moveDown(arena, player, hold);
};

const actionNames = [
  'MoveDown',
  'MoveLeft',
  'MoveRight',
  'Drop',
  'RotateClockwise',
  'RotateCounterClockWise',
  'Flip',
  'Swap',
];

const actionSpace = new Discrete(actionNames.length);

const moveDown = (arena, player, hold) => {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    return addPiece(merge(arena, player), player, hold);
  }
  return {arena, player, hold, done: false};
};

const makeStep = (arena, player, hold, action) => {
  switch (action) {
    case 0:
      return moveDown(arena, player, hold);
    case 1:
      return moveHorizontal(arena, player, hold, -1);
    case 2:
      return moveHorizontal(arena, player, hold, 1);
    case 3:
      return drop(arena, player, hold);
    case 4:
      return rotate(arena, player, hold, -1);
    case 5:
      return rotate(arena, player, hold, 1);
    case 6:
      return rotate(arena, player, hold, 2);
    case 7:
      return swap(arena, player, hold);
    default:
      throw new Error('Unknown action');
  }
};

export default class Tetris {
  constructor(config) {
    this.reset();
    this.renderer = new TetrisRenderer(config.canvasId, config.holdId);
  }

  reset() {
    this.arena = createMatrix(20, 12);// Play Field
    this.hold = randPiece();
    this.done = false;
    this.player = {
      pos: {x:4, y:0},
      matrix: randPiece(),
      score: 0,
    };
    return step({ arena: this.arena, hold: this.hold }, 0, false,
      {text: 'Environment\'s reset.'});
  }

  render() {
    this.renderer.render(this.arena, this.player, this.hold);
  }

  step(action) {
    if (this.done) {
      return step({arena: this.arena, hold: this.hold}, 0, this.done,
        {text: 'Already finished.'});
    } else if (!actionSpace.contains(action)) {
      return step({arena: this.arena, hold: this.hold}, 0, this.done,
        {text: 'Invalid action.'});
    }
    const priorScore = this.player.score;
    const res = makeStep(this.arena, this.player, this.hold, action);
    this.arena = res.arena;
    this.player = res.player;
    this.hold = res.hold;
    this.done = res.done;
    return step({
      arena: merge(this.arena, this.player),
      hold: cloneMatrix(this.hold)
    }, this.player.score - priorScore, this.done, {text: 'Step finished.'});
  }

  getState() {
    return deepCopy(this.board);
  }

  getActionSpace() {
    return new Discrete(actionNames.length);
  }
}
