import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import playerRoute from './api/player/router';
import cardRoute from './api/card/router';
import gameRoute from './api/game/router';
import roundRoute from './api/round/router';
import roundHistoryRoute from './api/round_history/router';

const app = express();


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type Authorization');
    next();
});

app.use('/player', playerRoute);
app.use('/card', cardRoute);
app.use('/game', gameRoute);
app.use('/round', roundRoute);
app.use('/round-history', roundHistoryRoute);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect(
    'mongodb://localhost:27017/software-coding-challenge',
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).then(result => {
    console.log(result)
    app.listen(8080)
}).catch(err => console.log(err))