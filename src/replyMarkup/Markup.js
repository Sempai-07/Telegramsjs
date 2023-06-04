/**
 * Class representing a button in the Telegram Bot API.
 * @class
 */
class Markup {
  /**
   * Creates a new instance of the Markup class.
   * @param {Object} [options={}] - Button settings.
   * @param {string} [options.text] - Text on the button.
   * @param {string} [options.action] - Button action to be passed to the event handler.
   * @param {string} [options.type='callback_data'] - Button action type. The default is 'callback_data'.
   * @param {boolean} [options.remove_keyboard=false] - Flag indicating whether to remove the inline markup.
   * @param {boolean} [options.web_app] - Flag indicating whether the button is for a web app.
   * @param {boolean} [options.force_reply] - Flag indicating whether to force a reply from the user.
   */
  constructor(options = {}) {
    this.text = options.text;
    this.action = options.action;
    this.type = options.type ?? 'callback_data';
    this.remove_keyboard = options.removeKeyboard ?? false;
    this.web_app = options.webApp;
    this.force_reply = options.forceReply;
    return this;
  }

  /**
   * Sets the button action type.
   * @param {string} type - Button action type.
   * @returns {Markup} Returns an instance of the Markup object for method chaining.
   */
  setType(type) {
    this.type = type;
    return this;
  }

  /**
   * Sets the button action.
   * @param {string} action - Button action to be passed to the event handler.
   * @returns {Markup} Returns an instance of the Markup object for method chaining.
   */
  setAction(action) {
    this.action = action;
    return this;
  }

  /**
   * Sets the text on the button.
   * @param {string} text - Text on the button.
   * @returns {Markup} Returns an instance of the Markup object for method chaining.
   */
  setText(text) {
    this.text = text;
    return this;
  }

  /**
   * Set the `remove_keyboard` option to remove the keyboard after the user presses a button.
   * @param {boolean} [remove=false] - Whether the keyboard should be removed after the user presses a button.
   * @returns {string} Returns a JSON string with the `remove_keyboard` option set to `true`.
   */
  static setRemove(remove = false) {
    return JSON.stringify({
      remove_keyboard: remove,
    });
  }

  /**
   * Sets the URL for the web app.
   * @param {string} url - The URL of the web app.
   * @returns {Markup} Returns the current object instance for chaining.
   */
  setWebApp(url) {
    this.web_app = url;
    return this;
  }

  /**
   * Sets the `force_reply` option for the reply keyboard.
   * @param {boolean} forceReply - Indicates whether to enable the force reply feature.
   * @returns {Markup} Returns the modified instance of the object.
   */
  setForceReply(forceReply) {
    this.force_reply = forceReply;
    return this;
  }

  /**
   * Creates a new Button object from a button object in the format expected by Telegram Bot API.
   * @param {object} buttonObj - Button object in the format expected by Telegram Bot API.
   * @returns {Markup} Returns an instance of the Markup object.
   */
  static fromJSON(buttonObj) {
    const button = new Markup()
      .setText(buttonObj.text)
      .setAction(buttonObj.action)
      .setType(buttonObj.type);
    return button;
  }

  /**
   * Returns the inline keyboard object in the format expected by Telegram Bot API.
   * @param {Array} buttons - A 2-dimensional array of Markup objects representing the buttons on the keyboard.
   * @returns {object} Returns the inline keyboard object in the format expected by Telegram Bot API.
   */
  static inlineKeyboard(buttons) {
    const inlineKeyboard = buttons.map((row) => {
      return row.map((button) => {
        return button.toJSON();
      });
    });

    return JSON.stringify({
      inline_keyboard: inlineKeyboard,
    });
  }

  /**
   * Generates a JSON string representing a reply markup object with an inline keyboard.
   * @param {Array} arrayMarkup - An array containing elements of the markup.
   * @param {number} [arrayLength=10] - The desired length of the markup array. Defaults to 10.
   * @returns {string} Returns a JSON string representing the reply markup object.
   */
  static addMarkupArray(arrayMarkup, arrayLength = 10) {
    let markup = [];
    for (let i = 0; i < arrayMarkup.length; i++) {
      markup.push(arrayMarkup[i]);
      if (markup.length === arrayLength) {
        break;
      }
    }
    return JSON.stringify({
      inline_keyboard: markup,
    });
  }

  /**
   * Returns the button object in the format expected by Telegram Bot API.
   * @returns {object} Returns the button object in the format expected by Telegram Bot API.
   */
  toJSON() {
    const button = {
      text: this.text,
      remove_keyboard: this.remove_keyboard,
      web_app: this.web_app,
      force_reply: this.force_reply,
    };
    button[this.type] = this.action;
    return button;
  }

  /**
   * Returns the text representation of the button object in the format expected by Telegram Bot API.
   * @returns {string} Returns the text representation of the button object in the format expected by Telegram Bot API.
   */
  toString() {
    return JSON.stringify(this.toJSON());
  }
}

module.exports = Markup;