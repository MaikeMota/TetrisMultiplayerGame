class Client {

    constructor(id, conn) {
        this.id = id;
        this.connection = conn;
        this.session = null;
        this.state = null;
    }

    send(data) {
        const message = JSON.stringify(data);
        //console.log(`Sending message ${message}`);
        this.connection.send(message, (err) => {
            if (err) {
                console.error(`Message Failed`, message, err)
            }
        });
    }

    broadcast(data) {
        if (!this.session) {
            throw new Error('Cannot broadcast without a session');
        }
        data.clientId = this.id;
        this.session.clients.forEach(client => {
            if (client.id !== this.id) {
                client.send(data);
            }
        });
    }
}

module.exports = Client;