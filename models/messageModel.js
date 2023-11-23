/* 
    Message model which has user id, text and timestamp
*/
class Message {
    constructor(sender, text) {
        this.sender = sender;
        this.text = text;
        this.timestamp = Date.now();
    }
}

// Converter for firestore for Message model
const messageConverter = {
    toFirestore: function (message) {
        return {
            sender: message.sender,
            text: message.text,
            timestamp: message.timestamp,
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot;
        return new Message(data.sender, data.text, data.timestamp);
    }
};

export { Message, messageConverter };