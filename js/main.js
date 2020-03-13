const tetrisManager = new TetrisManager(document);

let localTetris = tetrisManager.createPlayer();
localTetris.element.classList.add('local');
localTetris.run();

const connectionManager = new ConnectionManager(tetrisManager);

connectionManager.connect('wss://tetris-multiplayer-game.herokuapp.com');

const controllers = [
    {
        LEFT: 65,
        RIGHT: 68,
        DOWN: 83,
        ROTATE: 32
    },
    {
        LEFT: 37,
        RIGHT: 39,
        DOWN: 40,
        ROTATE: 96
    }
];

document.addEventListener('keydown', keyDownListener);
document.addEventListener('keyup', keyDownListener);

function keyDownListener(keyEvent) {
    let player = localTetris.player;
    for (let controller of controllers) {
        if (keyEvent.type === 'keydown') {
            switch (keyEvent.keyCode) {
                case controller.LEFT: {
                    player.move(-1);
                    break;
                }
                case controller.RIGHT: {
                    player.move(+1);
                    break;
                }
                case controller.ROTATE: {
                    player.rotate(1);
                    break;
                }
                case controller.DOWN: {
                    player.drop();
                    if (player.dropInterval !== player.DROP_FAST && !player.isPoisoned('super-speed')) {
                        player.dropInterval = player.DROP_FAST;
                    }
                    break;
                }
            }
        } else if (keyEvent.type === 'keyup' && keyEvent.keyCode === controller.DOWN) {
            player.drop();
            if (player.dropInterval !== player.DROP_SLOW && !player.isPoisoned('super-speed')) {
                player.dropInterval = player.DROP_SLOW;
            }
        }
    }
}
