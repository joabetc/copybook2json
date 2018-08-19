class CopyBook {
  toArray(copybook) {
    return copybook.split('\r\n');
  }
}

module.exports = new CopyBook();