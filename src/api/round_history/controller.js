import { validationResult } from 'express-validator';
import async from 'async';
import RoundHistory from './model';
import Round from '../round/model';

import { success } from '../../services/response/index';

export const create = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    for (let i = 0; i < req.body.length; i++) {
        req.body[i].active = true;
        req.body[i].number = i + 1;
        req.body[0].turn = true;
    }

    RoundHistory.create(req.body)
        .then(roHis => roHis.map(prop => prop.view()))
        .then(roHis => success(res, 201, roHis))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const list = async (req, res, next) => {
    let query_obj = { active: true }
    const count = await RoundHistory.countDocuments(query_obj)
    RoundHistory.find(query_obj)
        .populate('player', 'email')
        .populate('cards.card', 'type value')
        .then((roHis) => ({
            count: count,
            roHis: roHis.map(rh => rh.view())
        }))
        .then(roHis => success(res, 200, roHis))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const destroy = (req, res, next) => {
    RoundHistory.findOne({ _id: req.params.id })
        .then((roHis) => roHis ? roHis.remove() : null)
        .then(roHis => success(res, 200, roHis))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const distributeCard = async (req, res, next) => {
    const shuffledDeck = await Round.findOne({ _id: req.params.roundId }, { deck: true })
    const activePlayers = await RoundHistory.findOne({ round: req.params.roundId, player: req.params.playerId, active: true },
        { round: 1, cards: 1, active: true })
    let cardsPerPlayer = parseInt(req.params.cardsPerPlayer)

    if (activePlayers.cards.length === 0) { activePlayers.cards = [] }
    for (let i = 0; i < cardsPerPlayer; i++) {
        activePlayers.cards.push({ card: shuffledDeck.deck[i].card.id });
        shuffledDeck.deck.splice(i, 1);
    }
    shuffledDeck.save();
    activePlayers.save();
    res.status(200).json({ message: 'Card distributed to player.' })
}

export const throwCard = async (req, res, next) => {
    const roHis = await RoundHistory.findOne({ player: req.params.playerId })

    async.forEach(body.cards, (el, cb) => {
        roHis.cards.forEach((card, index) => {
            if (card.id === el.id) {
                roHis.cards.splice(index, 1);
                roHis.turn = false;
                roHis.save();
            }
            cb();
        })
    }, () => {
        res.status(200).json({
            message: 'Please wait for your next turn.'
        })
    })
}