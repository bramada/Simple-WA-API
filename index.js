"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const qrcode_1 = __importDefault(require("qrcode"));
const WhatsappService_1 = require("./services/WhatsappService");
const MessageWrite_1 = require("./rules/MessageWrite");
const Validator_1 = require("./helper/Validator");
const app = (0, express_1.default)();
const wa = new WhatsappService_1.WhatsappService();
wa.Initialize();
app.use(express_1.default.json());

app.get('/', (req, res) => {
    res.send('Im here.');
});

app.get('/status', (req, res) => {
    res.send(wa.GetStatus());
});

app.get('/qr', (req, res) => {
    const body = "<html><head><title>Whatsapp QrCode</title><script>setTimeout(function(){window.location.reload();}, 1000);</script></head><body>@body</body></html>";
    const status = wa.GetStatus();
    if (status.isConnected) {
        const response = "<div><h1 style='text-align: center;' >Whatsapp Connected to " + status.phoneNumber + "</h1></div>";
        const result = body.replace('@body', response);
        res.send(result);
    }
    else {
        qrcode_1.default.toDataURL(wa.qrcode, (err, url) => {
            if (err) {
                const response = "<div><h1 style='text-align: center;' >" + err.message + "</h1></div></div>";
                const result = body.replace('@body', response);
                res.send(result);
            }
            else {
                const response = "<div><img style='display: block; margin-left: auto; margin-right: auto; width: 30%;' src='" + url + "' alt='whatsapp qrcode' /></div>";
                const result = body.replace('@body', response);
                res.send(result);
            }
        });
    }
});

app.post('/message', (req, res) => {
    (0, Validator_1.validator)(req.body, MessageWrite_1.MessageWrite, {}, (error, isValid) => {
        if (!isValid) {
            res.status(400);
            res.send({
                status: "failed",
                errors: error.errors
            });
        }
        else {
            const message = req.body.message;
            const phoneNumber = req.body.phoneNumber;
            wa.SendWhatsappSimpleMessage(phoneNumber, message);
            res.send({
                status: "success",
                errors: null
            });
        }
    });
});

app.get('/message', (req, res) => {
    (0, Validator_1.validator)(req.query, MessageWrite_1.MessageWrite, {}, (error, isValid) => {
        if (!isValid) {
            res.status(400);
            res.send({
                status: "failed",
                errors: error.errors
            });
        }
        else {
            const message = req.query.message;
            const phoneNumber = req.query.phoneNumber;
            wa.SendWhatsappSimpleMessage(phoneNumber, message);
            res.send({
                status: "success",
                errors: null
            });
        }
    });
});

app.post('/logout', (req, res) => {
    wa.Logout();
    res.send({
        status: "success",
        errors: null
    });
});

// run express
const apiserver = app.listen(80, () => {
    console.log("Server alive");
});
