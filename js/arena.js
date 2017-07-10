class Arena {

    constructor(width, height) {
        const matrix = [];
        while (height--) {
            matrix.push(new Array(width).fill(0));
        }
        this.matrix = matrix;
        this.events = new Events();
    }

    clear() {
        this.matrix.forEach(row => row.fill(0));
        this.events.emit('matrix', this.matrix);
    }

    collide(matrix, position) {
        const [m, o] = [matrix, position];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (
                    m[y][x] !== 0 && (this.matrix[y + position.y] && this.matrix[y + position.y][x + position.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(matrix, position) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.matrix[y + position.y][x + position.x] = value;
                }
            });
        });
        this.events.emit('matrix', this.matrix);
    }

    sweep() {
        let rowCount = 0;
        let score = 0;
        outer: for (let y = this.matrix.length - 1; y > 0; --y) {
            for (let x = 0; x < this.matrix[y].length; ++x) {
                if (this.matrix[y][x] === 0) {
                    continue outer;
                }
            }
            const row = this.matrix.splice(y, 1)[0].fill(0);
            this.matrix.unshift(row);
            ++y;
            score += ++rowCount * 10;
            rowCount *= 2;
        }
        this.events.emit('matrix', this.matrix);
        return score;
    }


}