import { validationResult } from 'express-validator';

import Game from './model';

import { success } from '../../services/response/index';

export const create = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const gameCheck = await Game.findOne({ type: req.body.name })
    if (gameCheck) {
        res.status(422).json({
            message: `Choose another name.`
        })
        return
    }

    Game.create(req.body)
        .then((game) => game.view(true))
        .then(game => success(res, 201, game))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const list = (req, res, next) => {
    Game.find()
        .then((games) => ({
            data: games.map(game => game.view())
        }))
        .then(games => success(res, 200, games))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}