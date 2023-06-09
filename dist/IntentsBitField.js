"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeIntents = exports.IntentsBitField = void 0;
const errorcollection_1 = require("./errorcollection");
const IntentBits_1 = require("./constanta/IntentBits");
const TelegramIntentBits_1 = require("./constanta/TelegramIntentBits");
/**
 * @class IntentsBitField
 * @classdesc Represents a bit field for Telegram intents.
 */
class IntentsBitField {
    constructor(bits = 0) {
        this.bits = bits;
    }
    /**
     * Adds one or more bits to the bit field.
     * @param {...number} ints - The bits to add to the bit field.
     * @returns {IntentsBitField} The updated IntentsBitField instance.
     * @throws {BitFieldError} If a specified bit is not a number.
     */
    add(...ints) {
        const filter = ints.filter((i) => {
            if (typeof i !== "number") {
                throw new errorcollection_1.BitFieldError(`specified "${i}" is not correct`);
            }
        });
        for (const i of ints) {
            this.bits |= i;
        }
        return this;
    }
    /**
     * Removes one or more Telegram intents from the bitfield.
     * @param {...number} ints - The bits that represent the Telegram intents to be removed.
     * @returns {IntentsBitField} - The IntentsBitField instance.
     * @throws {BitFieldError} - If an invalid argument is passed.
     */
    remove(...ints) {
        const filter = ints.filter((i) => {
            if (typeof i !== "number") {
                throw new errorcollection_1.BitFieldError(`specified "${i}" is not correct`);
            }
        });
        for (const i of ints) {
            this.bits &= ~i;
        }
        return this;
    }
    /**
     * Returns the bitfield as a number.
     * @returns {number} - The bitfield.
     */
    serialize() {
        return this.bits;
    }
    /**
     * Returns an array of intent strings based on the current bit value
     * @method toArray
     * @returns {string[]} - Array of intent strings
     */
    toArray() {
        const arr = [];
        for (const [flag, bit] of Object.entries(IntentBits_1.IntentBits)) {
            if (this.has(bit)) {
                const intent = TelegramIntentBits_1.TelegramIntentBits[flag].replace(/_/g, "_");
                arr.push(intent);
            }
        }
        return arr;
    }
    /**
     * Checks if the bit field has a specific bit set
     * @method has
     * @param {number} bit - Bit to check
     * @returns {boolean} - True if the bit is set, false otherwise
     */
    has(bit) {
        return (this.bits & bit) === bit;
    }
}
exports.IntentsBitField = IntentsBitField;
/**
 * Decodes a bit field instance and returns an array of intent strings
 * @function decodeIntents
 * @param {IntentsBitField} intentsBitField - Bit field instance to decode
 * @returns {string[]} - Array of intent strings
 */
function decodeIntents(intentsBitField) {
    const botIntents = [];
    for (const [flag, bit] of Object.entries(IntentBits_1.IntentBits)) {
        if (intentsBitField === null || intentsBitField === void 0 ? void 0 : intentsBitField.has(bit)) {
            const intent = TelegramIntentBits_1.TelegramIntentBits[flag].replace(/_/g, "_");
            botIntents.push(intent);
        }
    }
    return botIntents;
}
exports.decodeIntents = decodeIntents;
