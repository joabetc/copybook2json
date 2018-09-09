class CPYItem {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set copybook_name(copybook_name) {
    this._copybook_name = copybook_name;
  }

  get copybook_name() { 
    return this._copybook_name;
  }
  
  set type(type) {
    this._type = type;
  }

  get type() {
    return this._type;
  }

  set start(start) {
    if (!isNaN(start)) {
      this._start = start;
    } else {
      throw new Error('Invalid property value! Must be a number.');
    }
  }

  get start() {
    return this._start;
  }

  set length(length) {
    if (!isNaN(length)) {
      this._length = length;
    } else {
      throw new Error('Invalid property value! Must be a number.');
    }
  }

  get length() {
    return this._length;
  }
}

module.exports = CPYItem;