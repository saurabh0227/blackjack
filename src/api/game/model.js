import mongoose, { Schema } from 'mongoose';

const gameSchema = new Schema({
    name: { type: String, trim: true, required: true },
}, {
    timestamps: true
});

gameSchema.methods = {
    view(full) {
        const view = {
            name: this.name
        }

        return full ? { ...view } : view;
    }
}

const model = mongoose.model('Game', gameSchema);

export default model;