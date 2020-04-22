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
        /** Check if enough card is available in deck */
        const noOfPlayers = await RoundHistory.countDocuments({ round: req.params.roundId, active: true })

        const shuffledDeck = await Round.findOne({ _id: req.params.roundId }, { deck: true, active: true })
            .populate('deck.card', 'value')

        let temp = (shuffledDeck.deck.length % (noOfPlayers * 4))

        if (shuffledDeck.deck.length === temp) {
            shuffledDeck.active = false;
            await shuffledDeck.save();
            res.status(302).json({ message: 'Not enough card is available in deck to distribute.' })
            return;
        }
        /** Check finished */

        const activePlayers = await RoundHistory.findOne({ round: req.params.roundId, player: req.params.playerId, active: true },
            { round: 1, playingCards: 1, active: true })

        //Number of cards for each player is four
        const cardsPerPlayer = 4;

        if (activePlayers.playingCards.length === 0) { activePlayers.playingCards = [] }
        for (let i = 0; i < cardsPerPlayer; i++) {
            if (shuffledDeck.deck[i].card.value === 'A') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id }); //Distributed
                shuffledDeck.deck.splice(i, 1); //Removed from deck
            }
            else if (shuffledDeck.deck[i].card.value === 'K') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === 'Q') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === 'J') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '10') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '9') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '8') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '7') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '6') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '5') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '4') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '3') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
            else if (shuffledDeck.deck[i].card.value === '2') {
                activePlayers.playingCards.push({ card: shuffledDeck.deck[i].card.id });
                shuffledDeck.deck.splice(i, 1);
            }
        }
        await shuffledDeck.save();
        await activePlayers.save();
        success(res, 200, activePlayers);
    } catch (err) {
        console.log(err)
        next()
    }
}

export const throwCard = async (req, res, next) => {
    try {
        const roHis = await RoundHistory.findOne({ player: req.params.playerId, active: true })
            .populate('playingCards.card', 'type value')

        for (let i = 0; i < roHis.playingCards.length; i++) {
            if (roHis.playingCards[i].card.value === 'A') {
                roHis.point += 3;
                roHis.playedCards.push({ card: roHis.playingCards[i].card.id });
                roHis.playingCards.splice(i, 1);
            }
            else if (roHis.playingCards[i].card.value === 'K') {
                roHis.point += 2;
                roHis.playedCards.push({ card: roHis.playingCards[i].card.id });
                roHis.playingCards.splice(i, 1);
            }
            else if (roHis.playingCards[i].card.value === 'Q') {
                roHis.point += 1;
                roHis.playedCards.push({ card: roHis.playingCards[i].card.id });
                roHis.playingCards.splice(i, 1);
            }
            else if (roHis.playingCards[i].card.value === 'J') {
                roHis.point += 1;
                roHis.playedCards.push({ card: roHis.playingCards[i].card.id });
                roHis.playingCards.splice(i, 1);
            }
            else {
                roHis.point += 0;
                roHis.playedCards.push({ card: roHis.playingCards[i].card.id });
                roHis.playingCards.splice(i, 1);
            }
        }

        await roHis.save();
    } catch (err) {
        console.log(err)
        next(err)
    }

}