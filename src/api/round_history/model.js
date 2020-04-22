import mongoose, { Schema } from 'mongoose';

const roundHistorySchema = new Schema({
    active: { type: Boolean, default: false },
    player: { type: Schema.ObjectId, ref: 'Player' },
    playingCards: [
        {
            card: { type: Schema.ObjectId, ref: 'Card' }
        }
    ],
    round: { type: Schema.ObjectId, ref: 'Round' },
    turn: { type: Boolean, default: false },
    winCount: { type: Number, default: 0 },
    lossCount: { type: Number, default: 0 },
    tieCount: { type: Number, default: 0 },
    number: { type: Number, default: 1 },
    playedCards: [{
        card: { type: Schema.ObjectId, ref: 'Card' }
    }],
    point: { type: Number, default: 0 }
}, {
    timestamps: true
});

roundHistorySchema.methods = {
    view(full) {
        const view = {
            id: this.id,
            active: this.active,
            player: this.player,
            playingCards: this.playingCards,
            round: this.round,
            turn: this.turn,
            winCount: this.winCount,
            lossCount: this.lossCount,
            tieCount: this.tieCount,
            number: this.number,
            playedCards: this.playedCards,
            point: this.point
        }

        const history = {
            playerName: this.player && this.player.name ? this.player.name : '--',
            roundName: this.round && this.round.name ? this.round.name : '--',
            winCount: this.winCount,
            lossCount: this.lossCount,
            tieCount: this.tieCount
        }

        if (full === 'history') return history
        else return view;
    }
}

const model = mongoose.model('RoundHistory', roundHistorySchema);

export default model;