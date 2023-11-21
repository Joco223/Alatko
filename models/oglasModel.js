/*
    Oglas model which has naziv, nazivLowercase, searchTerms,
    cena, kategorija, opis, slika, creationTime, userNaziv, user, oglasId
*/
class Oglas {
    constructor(id, naziv, nazivLowercase, searchTerms, cena, kategorija, opis, slika, userNaziv, user, oglasId) {
        this.id = id;
        this.naziv = naziv;
        this.nazivLowercase = nazivLowercase;
        this.searchTerms = searchTerms;
        this.cena = cena;
        this.kategorija = kategorija;
        this.opis = opis;
        this.slika = slika;
        this.creationTime = Date.now();
        this.userNaziv = userNaziv;
        this.user = user;
        this.oglasId = oglasId;
    }
}

// Converter for firestore for Oglas model
const oglasConverter = {
    toFirestore: function (oglas) {
        return {
            naziv: oglas.naziv,
            nazivLowercase: oglas.nazivLowercase,
            searchTerms: oglas.searchTerms,
            cena: oglas.cena,
            kategorija: oglas.kategorija,
            opis: oglas.opis,
            slika: oglas.slika,
            creationTime: oglas.creationTime,
            userNaziv: oglas.userNaziv,
            user: oglas.user,
            oglasId: oglas.oglasId,
        };
    },
    fromFirestore: function (snapshot, options) {
        const data = snapshot.data(options);
        return new Oglas(snapshot.id, data.naziv, data.nazivLowercase, data.searchTerms, data.cena, data.kategorija, data.opis, data.slika, data.creationTime, data.userNaziv, data.user, data.oglasId);
    }
};

export { oglasConverter, Oglas }