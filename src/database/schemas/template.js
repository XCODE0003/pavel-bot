import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id: Number,
    owner: Number,
    name: String,
    start: String,
    code: String,
    auth: String,
    password: String,
    wrongPassword: String,
    wrongCode: String,
    NaNCode: String,
    timeout: String,
    error: String,
    wait: String,
    contact: String,
    mailing1h: String,
    button: String,
    type: 'String',
    url: String,
    mailing1hUnauth: String,
    buttonUnauth: String,
    typeUnauth: String,
    urlUnauth: String,
    media_startbot: String,
});

export default mongoose.model("template", schema);