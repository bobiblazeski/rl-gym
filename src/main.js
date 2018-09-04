import TicTacToe from './ticTacToe/TicTacToe';

const make = (name, config) => {
  switch(name) {
  case 'TicTacToe':
    return new TicTacToe(config);
  default:
    throw `Environment with name: ${name}  is not defined`;
  }
};

export default {
  version: '1.0.0',
  make: make,
  environments: ['TicTacToe'],
};
