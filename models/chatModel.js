/*
    Chat model which has two user ids in a list,
    oglas id, list of messages and last message
*/
class Chat {
    constructor(id, users, oglas) {
        this.id = id;
        this.users = users;
        this.oglas = oglas;
        this.messages = [];
    }
}

// Converter for firestore for Chat model
const chatConverter = {
    toFirestore: function (chat) {
        return {
            users: chat.users,
            oglas: chat.oglas,
            messages: chat.messages,
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new Chat(snapshot.id, data.users, data.oglas, data.messages);
    }
};

export { chatConverter, Chat }