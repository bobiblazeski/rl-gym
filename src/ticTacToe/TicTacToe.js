import Discrete from '../spaces/Discrete';

const emptyBoard = () => [0,0,0,
                          0,0,0,
                          0,0,0];
const lines = [[0, 1, 2],// horizontal
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

const copy = arr => Array.from(arr);
const isTaken = (action, board) => board[action] !== 0;
const hasLine = (p, board) => {
    for (let line of lines) {
        if (line.every(l => board[l] == p)) {
            return true;
        }
    }
    return false;
};
const isDone = board => hasLine(playerA, board) || hasLine(playerB, board)
                        || !board.includes(0);
const pickRandomAction = board => {
    const empty = board.reduce((acc, e, i) => !e ? acc.concat(i) : acc, []);
    return empty[Math.floor(Math.random() * empty.length)];
};
const result = (observation, reward, info) => ({
    observation: copy(observation),
    reward,
    done: isDone(observation),
    info: {text: info},
});

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
        return result(board, 0, 'Already finished.');
    } else if (!actionSpace.contains(action)) {
        return result(board, 0, 'Invalid action.');
    } else if (isTaken(action, board)) {
        return result(board, 0, 'Position is taken.');
    }
    board[action] = playerA;
    if (hasLine(playerA, board)) {
        return result(board, 1, 'You win.');
    } else if (isDone(board)) {
        return result(board, 0, 'It\'s a draw.');
    }
    board[pickRandomAction(board)] = playerB;
    if (hasLine(playerB, board)) {
        return result(board, -1, 'You lose.');
    } else if (isDone(board)) {
        return result(board, 0, 'It\'s a draw.');
    }
    return result(board, 0, 'Step finished');
};

export default class TicTacToe {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = emptyBoard();
        return result(this.board, 0, 'Environment is reset.');
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
        return copy(this.board);
    }

    getActionSpace() {
        return new Discrete(9);
    }
}
