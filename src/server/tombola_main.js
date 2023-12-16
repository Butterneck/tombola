module.exports = class Tombola {
    constructor () {
        this.RandTools = require('./rand_tools.js');
    }

    /** 
     * Inizializza la struttura di un nuovo gioco
     * 
     * @param {string} room_name    Il nome della stanza
     * @param {string} room_slug    Lo slug della stanza (nome del file senza spazi)
     * @returns {object}            Restituisce la struttura completa della stanza
     */
    newGame (room_name, room_slug) {
        var game_data = { room_name: room_name, room_slug: room_slug, board: this.genBoard(), cards: [], last_reset: Date.now() };

        for (var i = 0; i < 30; i++) 
            game_data.cards.push({ taken: false, content: this.genCard() });

        return game_data;
    }

    /** 
     * Inizializza la struttura di un nuovo gioco, mantenendo le cartelle già create
     * 
     * @param {object} game_data    La struttura della stanza da resettare
     * @returns {object}            Restituisce la struttura completa della stanza
     */
    resetGame (game_data) {
        game_data.board = this.genBoard();
        game_data.last_reset = Date.now();

        for (var i = 0; i < game_data.cards.length; i++) 
            game_data.cards[i].taken = false;

        return game_data;
    }

    /** 
     * Rilascia tutte le cartelle "prenotate"
     * 
     * @param {object} game_data    La struttura della stanza da resettare
     * @returns {object}            Restituisce la struttura completa della stanza
     */
    resetCards (game_data) {
        game_data.last_reset = Date.now();

        for (var i = 0; i < game_data.cards.length; i++) 
            game_data.cards[i].taken = false;

        return game_data;
    }

    /** 
     * Inizializza un tabellone
     * 
     * @returns {object}  Restituisce la struttura di un tabellone vuoto
     */
    genBoard () {
        var board = { called_list: [], last_called: -1 };
        
        return board;
    }

    /** 
     * Genera una cartella casualmente
     * 
     * @returns {object}  Restituisce la struttura di una cartella
     */
    genCard () {
        const tools = new this.RandTools(); 
        const extract_pool = [];
        var card = [[], [], []];

        // Inizializzo un array per colonna
        for (var i = 0; i < 9; i++) {
            extract_pool[i] = new this.RandTools();
            extract_pool[i].distRandInit((i * 10) + 11, (i * 10) + 1);
        }

        // Estrazione per ogni riga
        for (var i = 0; i < 9; i++) {
            card[0].push(extract_pool[i].distRandNext());
            card[1].push(extract_pool[i].distRandNext());
            card[2].push(extract_pool[i].distRandNext());
        }

        // Buco la prima riga
        tools.distRandInit(9);
        for (var i = 0; i < 4; i++) card[0][tools.distRandNext()] = -1;

        // BuGo la seconda riga
        tools.distRandInit(9);
        for (var i = 0; i < 4; i++) card[1][tools.distRandNext()] = -1;

        // Buco la terza riga in funzione delle righe
        // precendenti (ogni colonna deve avere almeno un numero)
        tools.distRandInit(9);
        var buchi = 0;
        while (buchi < 4) {
            const hit = tools.distRandNext();

            if (card[0][hit] != -1 || card[1][hit] != -1) {
                card[2][hit] = -1;
                buchi++;
            }
        }

        return card;
    }
}