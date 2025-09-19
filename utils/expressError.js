class expressError extends Error {

    constructor(statusCode , message) {
        super();   // yhi se apne parents ko call lga rha hai iska mtlb hai ki vo Error class se hi kaam kara rha hai 
        this.statusCode = statusCode;
        this.message = message;

    }
}

module.exports = expressError;