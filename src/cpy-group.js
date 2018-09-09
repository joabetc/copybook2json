var CPYItem = require('./cpy-item');

class CPYGroup  extends CPYItem {
  constructor(cpyName) {
    super(cpyName);
  }

  set data(data) {
    this._data = Array.isArray(data) ? data : [].push(data);
  }

  get data() {
    return this._data;
  }
}

module.exports = CPYGroup;