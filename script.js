const $ = el => document.querySelector(el);
const $canvas = $('.stack-tower');
const $ctx = $canvas.getContext('2d');
const $modal = $('.stack-modal');

//////////////////////GLOBAL
let animationFrameId;
const INITIAL_X_SPEED = 5;
const INITIAL_Y_SPEED = 6;
const BOX_WIDTH = 200;
const BOX_HEIGTH = 50;
const INITIAL_Y_CANVAS = 600;
const MODES = {
  BOX_BOUNCE: 'box-bounce',
  BOX_FALL: 'box-fall',
  GAME_OVER: 'game-over'
};
let current, cameraY, scrollCounter, speedX, speedY, mode;

//////////////////////STATE
let boxes = [];
let restBox = { x: 0, y: 0, width: 0 };

//////////////////////FUNCTIONS
function generateColor() {
  return `rgb(
    ${~~(Math.random() * 200) + 50},
    ${~~(Math.random() * 200) + 50},
    ${~~(Math.random() * 200) + 50}
    )`;
}

function initialGameState() {
  boxes = [
    {
      x: $canvas.width / 2 - BOX_WIDTH / 2,
      y: 200,
      width: BOX_WIDTH,
      color: generateColor()
    }
  ];

  current = 1;
  scrollCounter = 0;
  cameraY = 0;
  mode = MODES.BOX_BOUNCE;
  speedX = INITIAL_X_SPEED;
  speedY = INITIAL_Y_SPEED;

  createNexBox();
}

function createNexBox() {
  boxes[current] = {
    width: boxes[current - 1].width,
    x: 0,
    y: (current + 10) * BOX_HEIGTH,
    color: generateColor()
  };
}

function drawBoxes() {
  boxes.forEach(box => {
    const { x, y, width, color } = box;
    const newY = INITIAL_Y_CANVAS - y + cameraY;
    $ctx.fillStyle = color;
    $ctx.fillRect(x, newY, width, BOX_HEIGTH);
  });
}

function drawRestOfBox() {
  const { x, y, width } = restBox;
  const newY = INITIAL_Y_CANVAS - y + cameraY;
  $ctx.fillStyle = 'red';
  $ctx.fillRect(x, newY, width, BOX_HEIGTH);
}

function createNewRestOfBox(difference) {
  const currentBox = boxes[current];
  const prevBox = boxes[current - 1];
  const restX =
    currentBox.x > prevBox.x ? currentBox.x + currentBox.width : prevBox.x;

  restBox = {
    x: restX,
    y: currentBox.y,
    width: difference
  };
}

function drawBackground() {
  //Gradient from top to bottom
  const newGradient = $ctx.createLinearGradient(
    $canvas.width / 2,
    0,
    $canvas.width / 2,
    $canvas.height
  );
  newGradient.addColorStop(0, '#000');
  newGradient.addColorStop(1, 'darkblue');
  $ctx.fillStyle = newGradient;
  $ctx.fillRect(0, 0, $canvas.width, $canvas.height);
}

function boxBounceMoveAndCollision() {
  const currentBox = boxes[current];
  currentBox.x += speedX;

  const hitRightSide = currentBox.x + currentBox.width > $canvas.width;
  const hitLeftSide = currentBox.x < 0;

  if (hitRightSide || hitLeftSide) {
    speedX *= -1;
  }
}

function gameOver() {
  $ctx.fillStyle = '#f008';
  $ctx.fillRect(0, 0, $canvas.width, $canvas.height);
  $modal.classList.add('modal-open');
}

function boxFallCollision() {
  const currentBox = boxes[current];
  const previousBox = boxes[current - 1];
  currentBox.y -= speedY;

  //When the box fall
  if (previousBox.y + BOX_HEIGTH === currentBox.y) {
    const diffWidth = currentBox.x - previousBox.x;

    if (currentBox.x > previousBox.x) {
      currentBox.width -= diffWidth;
    } else {
      currentBox.width += diffWidth;
      currentBox.x = previousBox.x;
    }

    //Game Over
    if (Math.abs(diffWidth) > previousBox.width || Math.abs(diffWidth) < 1) {
      mode = MODES.GAME_OVER;
      gameOver();
      return;
    }

    createNewRestOfBox(diffWidth);
    current++;
    scrollCounter = BOX_HEIGTH;
    mode = MODES.BOX_BOUNCE;
    createNexBox();
  }
}

function updateCamera() {
  if (scrollCounter > 0) {
    scrollCounter--;
    cameraY++;
  }
}

function drawGame() {
  if (mode === MODES.GAME_OVER) return;
  drawBackground();
  drawBoxes();
  drawRestOfBox();

  if (mode === MODES.BOX_BOUNCE) {
    boxBounceMoveAndCollision();
  } else if (mode === MODES.BOX_FALL) {
    boxFallCollision();
  }

  restBox.y -= speedY;
  updateCamera();
  animationFrameId = requestAnimationFrame(drawGame);
}

function initGame() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  initialGameState();
  drawGame();
}

//////////////////////EVENTS
document.addEventListener('DOMContentLoaded', initGame);

document.addEventListener('click', e => {
  if (
    e.target.matches('.again-game') ||
    (e.target.matches('.stack-tower') && mode === MODES.GAME_OVER)
  ) {
    $modal.classList.remove('modal-open');
    initGame();
  } else if (mode === MODES.BOX_BOUNCE && e.target.matches('.stack-tower')) {
    mode = MODES.BOX_FALL;
  }
});
