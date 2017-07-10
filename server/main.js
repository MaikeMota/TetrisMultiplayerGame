const WebSocketServer = require('ws').Server;
const Session = require('./session');
const Client = require('./client');

const server = new WebSocketServer({ port: 9000 });

const sessions = new Map();




function createId(len = 6, chars = 'abcdefghjkmnopqrstuvwxyz0123456789') {
    let id = '';
    while (len--) {
        id += chars[Math.random() * chars.length | 0];
    }
    return id;
}

function createSession(id = createId()) {
    if (sessions.has(id)) {
        throw new Error(`Session ${id} already exists`);
    }

    const session = new Session(id);
    console.log('Creating session', session);
    sessions.set(id, session);

    return session;
}

function getSession(id) {
    return sessions.get(id);
}

function createClient(conn, id = createId()) {
    return new Client(id, conn);
}

function broadcastSession(session) {
    const clients = [...session.clients];
    clients.forEach(client => {
        client.send({
            type: 'session-broadcast',
            peers: {
                you: client.id,
                clients: clients.filter((c => {
                    if (c.id !== client.id) {
                        return c;
                    }
                })).map(c => {
                    return {
                        id: c.id,
                        state: c.state

                    }
                })
            }
        })
    })
}

server.on('connection', conn => {

    console.log(`Connection established`);
    const client = createClient(conn);

    conn.on('message', message => {
        //console.log(`New Messsage Received: ${message}`);
        const data = JSON.parse(message);

        switch (data.type) {
            case 'create-session': {
                const session = createSession();
                session.join(client);
                client.state = data.state;
                client.send({
                    type: 'session-created',
                    id: session.id
                });
                break;
            }
            case 'join-session': {
                const session = getSession(data.id) || createSession(data.id);
                session.join(client);
                client.state = data.state;
                broadcastSession(session);
                break;
            }
            case 'state-update': {
                const [prop, value] = data.state;
                client.state[data.fragment][prop] = value;
                client.broadcast(data);
                break;
            }
            case 'poison': {
                client.broadcast(data);
                break;
            }
        }

        //console.log('Sessions', sessions);
    });

    conn.on('close', () => {
        console.log(`Connection Closed`);
        const session = client.session;
        if (session) {
            session.leave(client);
            if (session.clients.size === 0) {
                sessions.delete(session.id);
            }
        }

        broadcastSession(session);
    });
})