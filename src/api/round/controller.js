import { validationResult } from 'express-validator';
import Round from './model';
import Card from '../card/model';

import { success } from '../../services/response/index';

export const create = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    req.body.active = true;
    Round.create(req.body)
        .then(async (round) => {
            await shuffleCard(round)
            return round
        })
        .then(round => round.view(true))
        .then(round => success(res, 201, round))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const list = (req, res, next) => {
    Round.find()
        .populate('game', 'name')
        .populate('deck.card', 'type value')
        .then((rounds) => ({
            data: rounds.map(round => round.view())
        }))
        .then(round => success(res, 200, round))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

const shuffleCard = async (round) => {
    if (round && round.deck && round.deck.length === 0) { round.deck = [] }
    const cards = await Card.find({}, { _id: 1 })
    let currentIndex = cards.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }

    cards.forEach(card => {
        round.deck.push({
            card: card._id
        })
    })

    round.save()

    return;
}