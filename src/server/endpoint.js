module.exports = class Endpoint {
    /** 
     * Esegue una response con i risultati dell'elaborazione, in formato JSON
     * 
     * @param {object} res              Oggetto response di ExpressJS
     * @param {string} endpoint_name    Nome dell'endpoint richiesto
     * @param {object} params           Parametri passati all'endpoint
     */
    dispatchEndpoint(res, endpoint_name, params) {
        const Rooms = new (require('./rooms.js'));
        var the_room;
        var result = { status: 'OK', data: false, message: 'Result' };

        switch (endpoint_name) {
            /* Seleziona o crea la stanza */
            case 'room_select':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');

                the_room = Rooms.getRoom(params.room_name, true);

                if (the_room !== false) {
                    result.data = { room_name: the_room.room_name, room_slug: the_room.room_slug };
                } else return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza non valido<br>Deve essere lungo almeno 2 caratteri e può contenere solo lettere, numeri, spazi o underscore');
                break;

            /* Ottiene info sul tabellone */
            case 'get_board':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');

                the_room = Rooms.getRoom(params.room_name);

                if (the_room !== false) {
                    result.data = { room_name: the_room.room_name, board: the_room.board };
                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Ottiene le cartelle di una stanza */
            case 'get_cards':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');

                the_room = Rooms.getRoom(params.room_name);

                if (the_room !== false) {
                    result.data = { room_name: the_room.room_name, cards: the_room.cards };
                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Ottiene le cartelle in uso di una stanza */
            case 'get_used_cards':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');

                the_room = Rooms.getRoom(params.room_name);

                var used_cards = [];
                for (var i = 0; i < the_room.cards.length; i++) {
                    used_cards[i] = the_room.cards[i].taken;
                }

                if (the_room !== false) {
                    result.data = { room_name: the_room.room_name, cards: used_cards, last_reset: the_room.last_reset };
                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Ottiene le cartelle in uso di una stanza */
            case 'set_used_card':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');
                if (typeof params.card_sel === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Stato carta assente');
                if (typeof params.card_id === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'ID carta assente');

                the_room = Rooms.getRoom(params.room_name);

                if (the_room !== false) {
                    the_room.cards[params.card_id].taken = (params.card_sel == 'true');
                    Rooms.saveRoom(params.room_name, the_room);
                    result.message = 'Stato aggiornato';
                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Salva un numero estratto manualmente per il tabellone */
            case 'board_extract_manual':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');
                if (typeof params.number === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Numero estratto obbligatorio');

                the_room = Rooms.getRoom(params.room_name);

                if (the_room !== false) {
                    the_room.board.last_called = params.number;
                    the_room.board.called_list.push(the_room.board.last_called);
                    Rooms.saveRoom(params.room_name, the_room);

                    result.data = { board: the_room.board };
                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Reset del tabellone */
            case 'board_reset':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');

                the_room = Rooms.getRoom(params.room_name);

                if (the_room !== false) {
                    const Tombola = new (require('./tombola_main.js'));
                    Rooms.saveRoom(params.room_name, Tombola.resetGame(the_room));

                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Rilascio delle cartelle */
            case 'cards_reset':
                if (typeof params.room_name === 'undefined') return this.sendEndpoint(res, false, 'ERR', 'Nome della stanza obbligatorio');

                the_room = Rooms.getRoom(params.room_name);

                if (the_room !== false) {
                    const Tombola = new (require('./tombola_main.js'));
                    Rooms.saveRoom(params.room_name, Tombola.resetCards(the_room));
                } else return this.sendEndpoint(res, false, 'ERR', 'La stanza non esiste');
                break;

            /* Debug. Restituisce i valori dei parametri della request */
            case 'echo':
                result.data = { endpoint_name, params };
                break;
            default:
                result = { status: false, data: 'ERR', message: 'Endpoint non valido'};
                break;
        }

        this.sendEndpoint(res, result);
    }

    /** 
     * Esegue una response in formato JSON, con parametri prefissati
     * 
     * @param {object} res          Oggetto response di ExpressJS
     * @param {object} data         Dati elaborati da restituire dall'endpoint
     * @param {string} [status]     Stato finale dell'elaborazione (OK, ERR, WARN)
     * @param {string} [message]    Messaggio stato errore dell'elaborazione
     */
    sendEndpoint(res, data, status = 'OK', message = '') {
        if (typeof data !== 'object') 
            data = { status: status, data: data, message: message };
        res.send(JSON.stringify(data));
    }
}