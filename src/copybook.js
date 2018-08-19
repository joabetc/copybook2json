class CopyBook {
  toArray(copybook) {
    return copybook.split('\r\n').reduce((acum, curr) => {
      if (curr.substr(6, 1) !== '*' && !(/^( )+$/g).test(curr)) {
        acum.push(curr.substr(6, curr.lenght - 6));
      }
      return acum;
    },[]).join('\r\n');
  }
}

module.exports = new CopyBook();