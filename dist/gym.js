var gym = (function () {
  'use strict';

  const randInt = (n) => Math.floor(Math.random()*n);
  const between = (n, min, max) => min <= n && n < max;
  const deepCopy = (o) => JSON.parse(JSON.stringify(o));
  const cloneMatrix = (m) => m.map((arr) => arr.slice(0));

  const step = (observation, reward, done, info) => ({
    observation: deepCopy(observation), reward, done, info,
  });

  class Discrete {
    constructor(n) {
      this.n = n;
    }

    sample() {
      return randInt(this.n);
    }

    contains(x) {
      return Number.isInteger(x) && between(x, 0, this.n);
    }
  }

  // Colors for Tetrominoes
  const colors = [
    null,
    '#ffaaff',
    '#aaffff',
    '#ffaaaa',
    '#9999ff',
    '#aaaaff',
    '#aaffaa',
    '#ffdddd',
  ];

  const drawMatrix = (context, matrix, offset) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x,
            y + offset.y,
            1, 1);
        }
      });
    });
  };

  const drawMat = (hcon, matrix, offset) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          hcon.fillStyle = colors[value];
          hcon.fillRect(x + offset.x,
            y + offset.y,
            1, 1);
        }
      });
    });
  };

  const draw = (context, hcon, arena, player, hold) => {
    context.fillStyle='#000000';
    context.fillRect(0, 0, 240, 400);
    hcon.fillStyle='#111111';
    hcon.fillRect(0, 0, 80, 80);
    drawMatrix(context, arena, {x: 0, y: 0});
    drawMatrix(context, player.matrix, player.pos);
    drawMat(hcon, hold, {x:0, y:0});
  };

  class TetrisRenderer {
    constructor(canvasId, holdId) {
      const canvas = document.getElementById(canvasId);
      const hcanvas = document.getElementById(holdId);

      this.context = canvas.getContext('2d');
      this.hcon = hcanvas.getContext('2d');

      this.context.scale(19, 19);
      this.hcon.scale(19, 19);
    }

    render(arena, player, hold) {
      draw(this.context, this.hcon, arena, player, hold);
    }
  }

  const pieces = 'ILJOTSZ';

  const createPiece = (type) => {
    if (type === 'T') {
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    } else if (type === 'O') {
      return [
        [2, 2],
        [2, 2]
      ];
    } else if (type === 'L') {
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3]
      ];
    } else if (type === 'J') {
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0]
      ];
    } else if (type === 'I') {
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0]
      ];
    } else if (type === 'Z') {
      return [
        [0, 0, 0],
        [6, 6, 0],
        [0, 6, 6]
      ];
    } else if (type === 'S') {
      return [
        [0, 0, 0],
        [0, 7, 7],
        [7, 7, 0]
      ];
    }
  };

  const collide = (arena, player) => {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
           (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const createMatrix = (h, w) => {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  };

  const merge = (arena_, player) => {
    const arena = cloneMatrix(arena_);
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          arena[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
    return arena;
  };

  const randPiece = () => createPiece(pieces[pieces.length * Math.random() | 0]);

  const rot = (matrix_, dir) => {
    const matrix = cloneMatrix(matrix_);
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [
          matrix[x][y],
          matrix[y][x],
        ] = [
          matrix[y][x],
          matrix[x][y],
        ];
      }
    }
    if (dir > 0) {
      matrix.forEach((row) => row.reverse());
    } else {
      matrix.reverse();
    }
    return matrix;
  };

  const sweep = (arena, player) => {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;
      player.score += rowCount;
    }
  };

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

  class Tetris {
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

  const emptyBoard = () => [
    0,0,0,
    0,0,0,
    0,0,0];

  const lines = [
    [0, 1, 2],// horizontal
    [3, 4, 5],// horizontal
    [6, 7, 8],// horizontal
    [0, 3, 6],// vertical
    [1, 4, 7],// vertical
    [2, 5, 8],// vertical
    [0, 4, 8],// diagonal
    [2, 4, 6]];// diagonal

  const playerA = 1;
  const playerB = 2;
  const actionSpace$1 = new Discrete(9);
  const isTaken = (action, board) => board[action] !== 0;

  const hasLine = (p, board) => {
    for (let line of lines) {
      if (line.every((l) => board[l] == p)) {
        return true;
      }
    }
    return false;
  };

  const isDone = (board) => hasLine(playerA, board) || hasLine(playerB, board)
                          || !board.includes(0);

  const pickRandomAction = (board) => {
    const empty = board.reduce((acc, e, i) => !e ? acc.concat(i) : acc, []);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const render = (state) =>  {
    const arr = state;
    const n = 3;
    for (var i = 0, end = arr.length / n; i < end; ++i) {
      console.log(i, JSON.stringify(arr.slice(i * n, (i + 1) * n)));
    }
  };

  const makeStep$1 = (state, action) => {
    const board = Array.from(state);
    if (isDone(board)) {
      return step(board, 0, isDone(board), {text: 'Already finished.'});
    } else if (!actionSpace$1.contains(action)) {
      return step(board, 0, isDone(board), {text: 'Invalid action.'});
    } else if (isTaken(action, board)) {
      return step(board, 0, isDone(board), {text: 'Position is taken.'});
    }
    board[action] = playerA;
    if (hasLine(playerA, board)) {
      return step(board, 1, isDone(board), {text: 'You win.'});
    } else if (isDone(board)) {
      return step(board, 0, isDone(board), {text: 'It\'s a draw.'});
    }
    board[pickRandomAction(board)] = playerB;
    if (hasLine(playerB, board)) {
      return step(board, -1, isDone(board), {text: 'You lose.'});
    } else if (isDone(board)) {
      return step(board, 0, isDone(board), {text: 'It\'s a draw.'});
    }
    return step(board, 0, isDone(board), {text: 'Step finished'});
  };

  class TicTacToe {
    constructor() {
      this.reset();
    }

    reset() {
      this.board = emptyBoard();
      return step(this.board, 0, isDone(this.board),
        {text: 'Environment is reset.'});
    }

    render() {
      render(this.board);
    }

    step(action) {
      const res = makeStep$1(this.board, action);
      this.board = res.observation;
      return res;
    }

    getState() {
      return deepCopy(this.board);
    }

    getActionSpace() {
      return new Discrete(9);
    }
  }

  const make = (name, config) => {
    switch(name) {
      case 'Tetris':
        return new Tetris(config);
      case 'TicTacToe':
        return new TicTacToe(config);
      default:
        throw `Environment with name: ${name}  is not defined`;
    }
  };

  var main = {
    version: '1.0.0',
    make: make,
    environments: ['Tetris', 'TicTacToe'],
  };

  return main;

}());
