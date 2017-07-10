class Player {

    constructor(tetris) {
        this.tetris = tetris;
        this.arena = tetris.arena;
        this.lastDrop = 0;
        this.DROP_FAST = 50;
        this.DROP_SLOW = 1000;
        this.dropInterval = this.DROP_SLOW;
        this.score = 0;
        this.events = new Events();
        this.poisons = [];
        this.reset();
    }

    drop() {
        this.pos.y++;
        this.lastDrop = 0;
        if (this.arena.collide(this.matrix, this.pos)) {
            this.pos.y--;
            this.arena.merge(this.matrix, this.pos);
            let sweepScore = this.arena.sweep();
            if (sweepScore > 0) {
                this.updateScore(sweepScore);
            }
            this.reset();
            return;
        }
        this.events.emit('pos', this.pos);
    }

    move(dir) {
        this.pos.x += dir;
        if (this.arena.collide(this.matrix, this.pos)) {
            this.pos.x -= dir;
            return;
        }
        this.events.emit('pos', this.pos);
    }

    reset() {
        this.matrix = this.tetris.nextPiece();
        this.pos = {
            x: ((this.arena.matrix[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0)),
            y: 0
        }
        if (this.arena.collide(this.matrix, this.pos)) {
            this.arena.clear();
            this.updateScore(0, true);
        }
        this.events.emit('matrix', this.matrix);
    }

    rotate(dir) {
        const posX = this.pos.x;
        let offset = 1;
        this.rotateMatrix(this.matrix, dir);
        while (this.arena.collide(this.matrix, this.pos)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1))
            if (offset > this.matrix[0].length) {
                this.rotateMatrix(this.matrix, -dir);
                this.pos.x = posX;
                return;
            }
        }
        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
    }

    rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x]
                ] = [
                        matrix[y][x],
                        matrix[x][y]
                    ]
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    update(deltaTime) {
        this.lastDrop += deltaTime;
        if (this.lastDrop > this.dropInterval) {
            this.drop();
        }
    }

    updateScore(score, force) {
        if (force) {
            this.score = score;
        } else {
            this.score += score;
        }
        this.events.emit('score', this.score);
    }

    setPoison(type, config) {
        switch (type) {
            case 'super-speed': {
                this.dropInterval = config.speed;
                this.poisons.push('super-speed')
                setTimeout(() => {
                    this.poisons = this.poisons.splice(this.poisons.indexOf(type), 1);
                    this.dropInterval = this.DROP_SLOW;
                }, config.duration)
                break;
            }
        }
    }

    isPoisoned(type) {
        return this.poisons.indexOf(type) >= 0;
    }
}