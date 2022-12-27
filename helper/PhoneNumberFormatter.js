"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatToWhatsappJid = exports.FormatToIndonesian = void 0;
const FormatToIndonesian = function (number) {
    if (typeof (number) == 'undefined' || number == '') {
        return "";
    }
    number = number.replace(/\D/g, '');
    if (number.startsWith('62')) {
        number = '0' + number.substring(2);
    }
    return number;
};
exports.FormatToIndonesian = FormatToIndonesian;
const FormatToWhatsappJid = function (number) {
    if (typeof (number) == 'undefined' || number == '') {
        return "";
    }
    number = number.replace(/\D/g, '');
    if (number.startsWith('+')) {
        number = number.substring(1);
    }
    if (number.startsWith('08')) {
        number = '62' + number.substring(1);
    }
    if (!number.endsWith('@s.whatsapp.net')) {
        number = number + '@s.whatsapp.net';
    }
    return number;
};
exports.FormatToWhatsappJid = FormatToWhatsappJid;
