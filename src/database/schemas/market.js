import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: Number,
    token: String,
    price: Number,
    name: String,
    nameEn: String,
    bio: String,
    ru: Number,
    ua: Number,
    br: Number,
    in: Number,
    premium: Number,
    kz: Number,
    az: Number,
    kg: Number,
    pl: Number,
    pass: Number,
    spam: Number,
    success: {
        type: Number,
        default: 0
    },
    error: {
        type: Number,
        default: 0
    },
    resale: {
        type: Number,
        default: 0
    }
});

export default mongoose.model("market", schema);