import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: Number,
    worker: Number,
    dcId: Number,
    authKey: String,
    phone: String,
    uid: Number,
    bot: String,
    exported: {
        type: Boolean,
        default: false
    },
    created: {
        type: Number,
        default: Date.now()
    },
});

// Добавляем составной индекс для основных полей поиска
schema.index({ worker: 1, created: 1 });
schema.index({ bot: 1 });

export default mongoose.model("log", schema);
