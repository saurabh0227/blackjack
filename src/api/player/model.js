import mongoose, { Schema } from 'mongoose';

const playerSchema = new Schema({
    userName: { type: String },
    password: { type: String },
    email: { type: String },
}, {
    timestamps: true
});

playerSchema.methods = {
    view(full) {
        const view = {
            userName: this.userName,
            email: this.email
        }

        return full ? { ...view } : view
    }
}

const model = mongoose.model('Player', playerSchema);

export default model;