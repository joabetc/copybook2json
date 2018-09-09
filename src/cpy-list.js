var CPYGroup = require('./cpy-group');

class CPYList extends CPYGroup {
  set occurs(occurs) {
    this._occurs = occurs;
  }
  get occurs() {
    return this._occurs;
  }
}

module.exports = CPYList;
