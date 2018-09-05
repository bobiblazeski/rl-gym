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

export default class TetrisRenderer {
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
