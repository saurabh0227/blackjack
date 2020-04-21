import express from 'express';


import { create, list, destroy, throwCard, distributeCard } from './controller';

const router = express.Router();

router.post('/create', create);

router.get('/list', list);

router.delete('/delete/:id', destroy);

router.get('/distribute-card/:roundId/:playerId/:cardsPerPlayer', distributeCard);

router.put('/update/:playerId', throwCard);



export default router;