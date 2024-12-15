import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: Number,
    botId: Number,
    created: Number
});

export default mongoose.model("botUser", schema);