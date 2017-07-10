class ConnectionManager {

    constructor(tetrisManager) {
        this.connection = null;
        this.peers = new Map();
        this.tetrisManager = tetrisManager;
        this.localTetris = [...tetrisManager.instances][0]
    }

    connect(address) {
        this.connection = new WebSocket(address);

        this.connection.addEventListener('open', () => {
            console.log(`Connection established`);
            this.initSession();
            this.watchEvents();
        });

        this.connection.addEventListener('message', event => {
            //console.log(`Received message`, event.data);
            this.receive(event.data);
        });
    }

    initSession() {
        const sessionId = window.location.hash.split('#')[1];
        const state = this.localTetris.serialize();
        if (sessionId) {
            this.send({
                type: 'join-session',
                id: sessionId,
                state
            });
        } else {
            this.send({
                type: 'create-session',
                state
            });
        }
    }


    updateManager(peers) {
        let clients = peers.clients;
        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer();
                this.peers.set(client.id, tetris);
                tetris.unserialize(client.state);
            }
        });

        [...this.peers.entries()].forEach(([id, tetris]) => {
            if (!clients.some(client => client.id === id)) {
                this.tetrisManager.removePlayer(tetris);
                this.peers.delete(id);
            }
        });
    }

    updatePeer(id, fragment, [prop, value]) {
        if (!this.peers.has(id)) {
            console.error('Client does not exist!', id);
        }
        const tetris = this.peers.get(id);
        tetris[fragment][prop] = value;
        if (prop === 'score') {
            tetris.updateScore(value);
        } else {
            if (fragment === 'arena' && prop === 'matrix') {
                console.table(value);
            }
            tetris.draw();
        }
    }

    receive(message) {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'session-created': {
                window.location.hash = data.id;
                break;
            }
            case 'session-broadcast': {
                this.updateManager(data.peers);
                break;
            }
            case 'state-update': {
                this.updatePeer(data.clientId, data.fragment, data.state);
                break;
            }
            case 'poison': {
                this.localTetris.player.setPoison(data.fragment, data.state);
                break;
            }
        }
    }

    send(data) {
        const message = JSON.stringify(data);
        //console.log(`Sending message ${message}`);
        this.connection.send(message);
    }

    watchEvents() {

        this.localTetris.events.listen('poison', ([fragment, state]) => {
            this.send({
                type: 'poison',
                fragment: fragment,
                state: state,

            });
        })

        const player = this.localTetris.player;
        ['pos', 'matrix', 'score'].forEach(prop => {
            player.events.listen(prop, (value) => {
                this.send({
                    type: 'state-update',
                    fragment: 'player',
                    state: [prop, value]
                });
            });
        });

        const arena = this.localTetris.arena;
        ['matrix'].forEach(prop => {
            arena.events.listen(prop, (value) => {
                this.send({
                    type: 'state-update',
                    fragment: 'arena',
                    state: [prop, value]
                });
            });
        });
    }
}