/* 
    User model which has naziv, lokacija, opis, telefon
*/
class User {
    constructor(id, naziv, lokacija, opis, telefon, email, slika) {
        this.id = id;
        this.naziv = naziv;
        this.lokacija = lokacija;
        this.opis = opis;
        this.telefon = telefon;
        this.email = email;
        this.slika = slika;
    }
}

// Converter for firestore for User model
const userConverter = {
    toFirestore: function (user) {
        return {
            naziv: user.naziv,
            lokacija: user.lokacija,
            opis: user.opis,
            telefon: user.telefon,
            email: user.email,
            slika: user.slika,
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new User(snapshot.id, data.naziv, data.lokacija, data.opis, data.telefon, data.email, data.slika);
    }
};

export { userConverter, User }