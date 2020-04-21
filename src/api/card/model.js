import mongoose, { Schema } from 'mongoose';

const types = ['Club', 'Diamond', 'Spade', 'Suit']
const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] // High to Low

const cardSchema = new Schema({
    type: { type: String, enum: types },
    value: { type: String, enum: values }
}, {
    timestamps: true
});

cardSchema.methods = {
    view(full) {
        const view = {
            type: this.type,
            value: this.value
        }

        return full ? { ...view } : view
    }
}

const model = mongoose.model('Card', cardSchema);

export default model;