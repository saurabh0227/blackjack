import express from 'express';
import { body } from 'express-validator';

import Player from './model';

import { registerPlayer, login, list, history } from './controller';

const router = express.Router();

router.post('/register-player', [
    body('email').isEmail().withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return Player.findOne({ email: value }).then(playerDoc => {
                if (playerDoc) {
                    return Promise.reject('E-mail address already exists!');
                }
            });
        })
        .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('userName').trim().not().isEmpty()
],
    registerPlayer);

router.post('/login', login);

router.get('/list', list);

router.get('/history', history)



export default router;