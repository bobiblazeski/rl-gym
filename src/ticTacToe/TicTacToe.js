import Discrete from '../spaces/Discrete';
import { deepCopy, step } from '../util';

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
const actionSpace = new Discrete(9);
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

const makeStep = (state, action) => {
  const board = Array.from(state);
  if (isDone(board)) {
    return step(board, 0, isDone(board), {text: 'Already finished.'});
  } else if (!actionSpace.contains(action)) {
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

export default class TicTacToe {
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
    const res = makeStep(this.board, action);
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
