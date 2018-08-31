import TicTacToe from './ticTacToe/TicTacToe';

const make = name => {
    switch(name) {
        case 'TicTacToe':
            return new TicTacToe();
        default:
            throw `Environment with name: ${name}  is not defined`;
    }
};

export default {
    version: '1.0.0',
    make: make,
    environments: ['TicTacToe']
};
