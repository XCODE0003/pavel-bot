import mongoose from "mongoose";

const schema = new mongoose.Schema({
    value: {
        type: Number,
        default: 0
    },
    ref: {
        type: Number,
        default: 0
    },
    proxy: {
        type: String,
        default: "iproyal"
    }

});

export default mongoose.model("commission", schema);