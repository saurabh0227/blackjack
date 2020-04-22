import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import _ from 'lodash';

import Player from './model';
import RoundHistory from '../round_history/model';

import { success } from '../../services/response/index';

export const registerPlayer = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const userName = req.body.userName;
    const password = req.body.password;
    const email = req.body.email;
    const name = req.body.name;
    bcrypt.hash(password, 12)
        .then(async (hashedPw) => {
            const player = new Player({
                userName: userName,
                email: email,
                password: hashedPw,
                name: name
            });
            await player.save();
            return player;
        })
        .then(player => player.view(true))
        .then(player => success(res, 201, player))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

export const login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    Player.findOne({ email: email })
        .then(player => {
            if (!player) {
                const error = new Error('A player with this email could not be found.');
                error.statusCode = 401;
                throw error;
            }
            return bcrypt.compare(password, player.password)
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.statusCode = 401;
                throw error;
            }
            res.status(200).json({
                message: `Player logined successfully!`
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

export const list = (req, res, next) => {
    Player.find()
        .then((players) => ({
            data: players.map(player => player.view())
        }))
        .then(players => success(res, 200, players))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const history = (req, res, next) => {
    let view = req.query.view ? req.query.view : null;
    RoundHistory.find({ player: req.query.playerId })
        .populate('player', 'name')
        .populate(
            {
                path: 'round',
                select: 'game name',
                populate: {
                    path: 'game',
                    select: 'name'
                }
            }
        )
        .then((histories) => ({
            data: histories.map(history => history.view(view))
        }))
        .then(histories => success(res, 200, histories))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}