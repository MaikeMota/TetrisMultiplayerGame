const pieces = 'TLJOISZ';

class Tetris {

    constructor(element) {

        this.element = element;

        this.canvas = this.element.querySelector('canvas');;
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20);

        this.arena = new Arena(12, 20);

        this.events = new Events();

        this.scoreBoard = new CountUp(element.querySelector('.score'), 0, 0);

        this.player = new Player(this);

        let scoreHandler = this.updateScore.bind(this);
        this.player.events.listen('score', scoreHandler);

        this.colors = [
            null,
            '#FF0D72',
            '#0DC2FF',
            '#0DFF72',
            '#F538FF',
            '#FF8E0D',
            '#FFE138',
            '#3877FF'
        ];

        let lastUpdate = 0;

        this._update = (time = 0) => {
            const deltaTime = time - lastUpdate;
            lastUpdate = time;
            this.player.update(deltaTime);
            this.draw();
            requestAnimationFrame(this._update);
        }
    }

    clear() {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.clear();
        this.drawMatrix(this.arena.matrix);
        this.drawMatrix(this.player.matrix, this.player.pos);
    }

    drawMatrix(matrix, offset) {
        let offsetX = 0;
        let offsetY = 0;
        if (offset) {
            offsetX = offset.x;
            offsetY = offset.y;
        }
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = this.colors[value];
                    this.context.fillRect(x + offsetX, y + offsetY, 1, 1);
                }
            });
        });
    }

    nextPiece() {
        let type = pieces[pieces.length * Math.random() | 0];
        if (type === 'I') {
            this.events.emit('poison', ['super-speed', { speed: Math.random() * 150, duration: (Math.random() * 2500) + 1500 }]);
        }
        return createPiece(type);
    }

    run() {
        this._update();
    }

    serialize() {
        return {
            arena: {
                matrix: this.arena.matrix
            },
            player: {
                matrix: this.player.matrix,
                post: this.player.pos,
                score: this.player.score
            }
        }
    }

    unserialize(state) {
        this.arena = Object.assign(state.arena);
        this.player = Object.assign(state.player);
        this.updateScore(this.player.score);
        this.draw();
    }

    updateScore(score) {
        this.scoreBoard.update(score);
    }
}

function createPiece(type) {
    switch (type) {
        case 'T': {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
        }
        case 'O': {
            return [
                [2, 2],
                [2, 2]
            ];
        }
        case 'L': {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ];
        }
        case 'J': {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ];
        }
        case 'I': {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0]
            ];
        }
        case 'S': {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
        }
        case 'Z': {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
        }
    }
}
