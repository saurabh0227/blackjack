import { validationResult } from 'express-validator';

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
        const noOfPlayers = await RoundHistory.countDocuments({ round: req.query.roundId, active: true })

        const shuffledDeck = await Round.findOne({ _id: req.query.roundId }, { deck: true, active: true })
            .populate('deck.card', 'value')

        let temp = (shuffledDeck.deck.length % (noOfPlayers * 4))

        if (shuffledDeck.deck.length === temp) {
            shuffledDeck.active = false;
            await shuffledDeck.save();
            res.status(302).json({ message: 'Not enough card is available in deck to distribute.' })
            return;
        }
        /** Check finished */

        const activePlayers = await RoundHistory.findOne({ round: req.query.roundId, player: req.query.playerId, active: true },
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
        const player = await RoundHistory.findOne({ player: req.query.playerId, active: true })
            .populate('playingCards.card playedCards.card', 'type value')

        /** Check if card is availble to proceed the game for particular player */
        if (player.playingCards.length === 0) {
            player.active = false;
            await player.save();
            res.status(200).json({ message: `You don't have any card left to continue the game. Please wait for the final result.` })
            return;
        }
        /** Check finished */

        //Player only throw the fist card from playing cards
        if (player.playingCards[0].card.value === 'A') {
            player.point += 3;
            player.playedCards.push({ card: player.playingCards[0].card.id });
            player.playingCards.splice(0, 1);
        }
        else if (player.playingCards[0].card.value === 'K') {
            player.point += 2;
            player.playedCards.push({ card: player.playingCards[0].card.id });
            player.playingCards.splice(0, 1);
        }
        else if (player.playingCards[0].card.value === 'Q') {
            player.point += 1;
            player.playedCards.push({ card: player.playingCards[0].card.id });
            player.playingCards.splice(0, 1);
        }
        else if (player.playingCards[0].card.value === 'J') {
            player.point += 1;
            player.playedCards.push({ card: player.playingCards[0].card.id });
            player.playingCards.splice(0, 1);
        }
        else {
            player.point += 0;
            player.playedCards.push({ card: player.playingCards[0].card.id });
            player.playingCards.splice(0, 1);
        }

        await player.save();
        success(res, 200, player);
    } catch (err) {
        console.log(err)
        next(err)
    }

}

export const updateWinnerCount = async (req, res, next) => {
    try {
        const roHis = await RoundHistory.find({ round: req.query.roundId, active: false }, {
            player: 1, round: 1, winCount: 1, lossCount: 1, point: 1
        })
            .sort({ point: -1 })
            .populate('player round', 'name')


        await RoundHistory.updateOne({ player: roHis[0].player.id }, { $inc: { winCount: 1 } })

        success(res, 200, roHis)
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const showWinnerPerRound = async (req, res, next) => {
    try {
        const winner = await RoundHistory.findOne({ round: req.query.roundId, winCount: { $gte: 0 }, active: false }, {
            round: 1, player: 1, winCount: 1, point: 1
        })
            .populate('player round', 'name')

        success(res, 200, winner)
    } catch (err) {
        console.log(err)
        next(err)
    }
}