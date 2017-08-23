const moment = require('moment');

generateMessage = (from, text) => {
    return {
        'from': from,
        'text': text,
        'createdAt': moment().valueOf()
    };
}

module.exports = {generateMessage};
