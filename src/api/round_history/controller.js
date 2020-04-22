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

    if (req.body.length !== 4) {
        res.status(302).json({ message: 'You must add four player to start the game/round' })
        return
    }

    for (let i = 0; i < req.body.length; i++) {
        req.body[i].active = true;
        req.body[i].number = i + 1;

        //Fixed the player with number = 1, to start the game
        if (req.body[i].number === 1) {
            req.body[i].turn = true;
        }
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
        .populate('playingCards.card', 'type value')
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
    try {
        const shuffledDeck = await Round.findOne({ _id: req.params.roundId }, { deck: true })
            .populate('deck.card', 'value')
        const activePlayers = await RoundHistory.findOne({ round: req.params.roundId, player: req.params.playerId, active: true },
            { round: 1, playingCards: 1, active: true })
        // let cardsPerPlayer = parseInt(req.params.cardsPerPlayer)

        // //Only max of 4 playing cards can be distribute to the players.
        // if (cardsPerPlayer !== 4) {
        //     res.status(301).json({ message: 'Only dustribute max of 4 cards to each player' })
        //     return
        // }

        //Number of cards for each player is four
        const cardsPerPlayer = 4;

        //color or type of card
        const cardType = req.params.cardType;
        activePlayers.cardType = cardType;

        if (activePlayers.playingCards.length === 0) { activePlayers.playingCards = [] }
        for (let i = 0; i < cardsPerPlayer; i++) {
            if (shuffledDeck.deck[i].card.value === 'A') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 1 }); //Distributed
                shuffledDeck.deck.splice(i, 1); //Removed from deck
            }
            else if (shuffledDeck.deck[i].card.value === 'K') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 2 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === 'Q') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 3 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === 'J') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 4 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '10') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 5 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '9') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 6 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '8') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 7 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '7') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 8 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '6') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 9 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '5') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 10 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '4') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 11 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '3') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 12 });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '2') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id, rank: 13 });
                shuffledDeck.deck.splice(i, 1);
            }
        }
        await shuffledDeck.save();
        await activePlayers.save();
        res.status(200).json({ message: 'Card distributed to player.' })
    } catch (err) {
        console.log(err)
        next()
    }
}

export const throwCard = async (req, res, next) => {
    const roHis = await RoundHistory.findOne({ player: req.params.playerId })
        .populate('playingCards.card', 'type value')


}

const checkForHighCard = async (roHis, card) => {
    for (let i = 0; i < card.length; i++) {
        if (card[i].value === 'K' || card[i].value === 'Q' || card[i].value === '10' || card[i].value === '9') {
            handRank.filter(el => {
                if (el === 'High card') {
                    return '1'
                }
            })
        }
    }
}