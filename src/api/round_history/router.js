import express from 'express';


import { create, list, destroy, distributeCard, throwCard, updateWinnerCount, showWinnerPerRound } from './controller';

const router = express.Router();

router.post('/create', create);

router.get('/list', list);

router.delete('/delete/:id', destroy);

router.get('/distribute-card', distributeCard);

router.get('/throw-card', throwCard);

router.get('/update-winner-count', updateWinnerCount);

router.get('/show-winner-per-round', showWinnerPerRound);



export default router;