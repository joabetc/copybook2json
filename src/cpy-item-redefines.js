var CPYItem = require('./cpy-item');

class CPYItemRedefines extends CPYItem {
  set redefines(redefines) {
    this._redefines = redefines;
  }

  get redefines() {
    return this._redefines;
  }
}

module.exports = CPYItemRedefines;
