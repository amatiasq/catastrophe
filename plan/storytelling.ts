// necesito dos cosas:

// una bitácora donde se apunte lo más importante del DÍA
// un sistema de mensajería que genere el evento más importante del día

interface Bitacora {
  importancia: number;
  fecha: Date,
  descripción: string,
}

new Bitacora(1, Date.now(), ‘un extranjero vino y nos robó lo que teníamos, nos tiene prisioneros en celdas’);

interface Day {

}


class Plant {
    onGrow() {
        this.size++;
        game.day.register({
            importance: 0.1
            type: change,
            subject: 'plant',
            adjective: 'growing better',
        })
    }
}

...

game.day.registerSubject('plant', {
    singular: 'la planta',
    plural: 'las plantas',
    default: 'las plantas',
})

game.day.registerVerb('to be', {
    s1: 'estoy',
    s2: 'estás',
    s3: 'está',
    p1: 'estamos',
    p2: 'estais',
    p3: 'están',
    // s3m: 'he'
    // s3f: 'she'
})

game.day.registerType('change', ({ v, subject }) => {
    `parece que ${subject} están ${v(subject)} `)}
})

> const a = new Plant(game);
> a.onGrow();
> game.day.generateBinnacleEntry()
'parece que las plantas están creciendo bien'
