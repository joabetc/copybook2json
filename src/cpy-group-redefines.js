var CPYGroup = require('./cpy-group');

class CPYGroupRedefines extends CPYGroup {
  set redefines(redefines) {
    this._redefines = redefines;
  }

  get redefines() {
    return this._redefines;
  }
}

module.exports = CPYGroupRedefines;
