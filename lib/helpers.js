module.exports = {

  generateRandomString : function () {
    const length = 6; 
    return Math.random().toString(36).replace('0.', '').substr(0, length);
  }

}
