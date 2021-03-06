import mongoose, { Schema } from 'mongoose';

const roundSchema = new Schema({
    active: { type: Boolean, default: false },
    name: { type: String },
    // Deck with shuffled card
    deck: [
        {
            card: { type: Schema.ObjectId, ref: 'Card' }
        }
    ]
}, {
    timestamps: true
});

roundSchema.methods = {
    view(full) {
        const view = {
            id: this.id,
            active: this.active,
            name: this.name,
            deck: this.deck
        }

        return full ? { ...view } : view;
    }
}

const model = mongoose.model('Round', roundSchema);

export default model;