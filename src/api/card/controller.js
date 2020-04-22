import { validationResult } from 'express-validator';

import Card from './model';

import { success } from '../../services/response/index';

export const create = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const cardCheck = await Card.findOne({ type: req.body.type, value: req.body.value })
    if (cardCheck) {
        res.status(422).json({
            message: `Choose another sequence.`
        })
        return
    }

    Card.create(req.body)
        .then(card => card.view(true))
        .then(card => success(res, 201, card))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

export const list = (req, res, next) => {
    let query_obj = {};
    if (req.query.type) { query_obj.type = { $regex: new RegExp(req.query.type, 'gi') } }
    if (req.query.value) { query_obj.value = { $regex: new RegExp(req.query.value, 'gi') } }
    Card.find(query_obj)
        .then((cards) => ({
            data: cards.map(card => card.view())
        }))
        .then(cards => success(res, 200, cards))
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}