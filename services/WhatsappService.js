"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
const PhoneNumberFormatter_1 = require("../helper/PhoneNumberFormatter");
const AUTH_FILE_LOCATION = './data/session.json';
const { state, saveState } = (0, baileys_1.useSingleFileAuthState)(AUTH_FILE_LOCATION);
class WhatsappService {
    constructor() {
        this.qrcode = "";
        this.phoneNumber = "";
    }
    Initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sock = yield this.CreateNewSocket();
        });
    }
    CreateNewSocket() {
        return __awaiter(this, void 0, void 0, function* () {
            const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
            console.log(`Using wa version v${version.join('.')}, isLatest: ${isLatest}`);
            var socket = (0, baileys_1.default)({
                version: version,
                printQRInTerminal: true,
                auth: state,
                getMessage: (key) => __awaiter(this, void 0, void 0, function* () {
                    return {
                        conversation: 'hello'
                    };
                })
            });
            // autoreconnect
            socket.ev.on('connection.update', (update) => {
                var _a, _b, _c, _d;
                const { connection, lastDisconnect, isNewLogin, qr } = update;
                if (connection == 'close') {
                    const statusCode = (_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode;
                    console.log('connection closed due to', (_c = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _c === void 0 ? void 0 : _c.message, statusCode);
                    if (statusCode !== baileys_1.DisconnectReason.loggedOut) {
                        this.sock = this.CreateNewSocket();
                    }
                }
                else if (connection === 'open') {
                    // saat connection open, ambil nomor hp yang sedang terkoneksi
                    console.log('opened connection');
                    this.phoneNumber = (0, PhoneNumberFormatter_1.FormatToIndonesian)((_d = state.creds.me) === null || _d === void 0 ? void 0 : _d.id);
                    this.qrcode = "";
                }
                console.log(`connection update: ${connection}, isNewLogin: ${isNewLogin}, qr: ${qr}`);
                if (qr !== undefined) {
                    console.log("gets qr code");
                    this.qrcode = qr;
                }
            });
            socket.ev.on('creds.update', saveState);
            socket.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`));
            socket.ev.on('chats.update', m => console.log(m));
            socket.ev.on('chats.delete', m => console.log(m));
            socket.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`));
            socket.ev.on('contacts.upsert', m => console.log(m));
            socket.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`));
            socket.ev.on('messages.upsert', (m) => __awaiter(this, void 0, void 0, function* () {
                console.log('got messages', m.messages);
                m.messages.forEach(message => {
                    if (message.key.fromMe || m.type !== 'notify') {
                        return;
                    }
                    console.log('got message from:', message.key.remoteJid, 'name:', message.pushName, 'message:', message);
                });
            }));
            socket.ev.on('messages.update', m => console.log(m));
            socket.ev.on('message-receipt.update', m => console.log(m));
            socket.ev.on('presence.update', m => console.log(m));
            return socket;
        });
    }
    SendWhatsappSimpleMessage(phoneNumber, message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Sending To:', phoneNumber, 'with message:', message);
            const jid = (0, PhoneNumberFormatter_1.FormatToWhatsappJid)(phoneNumber);
            console.log('Formatted jid to:', jid);
            yield this.sock.presenceSubscribe(jid);
            yield (0, baileys_1.delay)(10);
            yield this.sock.sendPresenceUpdate('composing', jid);
            yield (0, baileys_1.delay)(10);
            yield this.sock.sendPresenceUpdate('paused', jid);
            yield (0, baileys_1.delay)(10);
            yield this.sock.sendMessage(jid, {
                text: message
            });
        });
    }
    GetStatus() {
        if (this.qrcode === "") {
            return {
                isConnected: true,
                phoneNumber: this.phoneNumber,
                qrcode: ""
            };
        }
        return {
            isConnected: false,
            phoneNumber: "",
            qrcode: this.qrcode
        };
    }
    Logout() {
        this.sock.logout();
    }
}
exports.WhatsappService = WhatsappService;
;
