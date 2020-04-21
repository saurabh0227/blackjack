import mongoose, { Schema } from 'mongoose';

const roundHistorySchema = new Schema({
    active: { type: Boolean, default: false },
    player: { type: Schema.ObjectId, ref: 'Player' },
    cards: [
        {
            card: { type: Schema.ObjectId, ref: 'Card' }
        }
    ],
    round: { type: Schema.ObjectId, ref: 'Round' },
    turn: { type: Boolean, default: false },
    winCount: { type: Number, default: 0 },
    lossCount: { type: Number, default: 0 },
    tieCount: { type: Number, default: 0 },
    number: { type: Number, default: 1 }
}, {
    timestamps: true
});

roundHistorySchema.methods = {
    view(full) {
        const view = {
            active: this.active,
            player: this.player,
            cards: this.cards,
            round: this.round,
            turn: this.turn,
            winCount: this.winCount,
            lossCount: this.lossCount,
            tieCount: this.tieCount,
            number: this.number
        }

        const history = {
            player: this.player && this.player.userName ? this.player.userName : '--',
            round: this.round && this.round.name ? this.round.name : '--',
            game: this.round && this.round.game && this.round.game.name ? this.round.game.name : '--',
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