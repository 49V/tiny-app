module.exports = {

  generateRandomString : function () {
    const length = 6; 
    return Math.random().toString(36).replace('0.', '').substr(0, length);
  },

  /*
  * Takes a nested object and for a given property, returns the key for the object if it exists, otherwise false
  * 
  * @param  object    : A nested object, i.e. : const object = { "someObject" : {property1: "some value"...}}
  * @param  property  : A string containing the desired property value to be searched for
  * @return value     : A string containing the value to be compared
  */
  getCorrectKey : function (object, property) {
    for (const key in object) {
      const user = object[key];

      if(user[property]) {
        return key;
      }

    }
    return false;
  },

  /*
  * Takes a nested object and for a given property, checks if a value and determines if the value exists
  * in that object
  * 
  * @param  object    : A nested object, i.e. : const object = { "someObject" : {property1: "some value"...}}
  * @param  property  : A string containing the desired property value to be searched for
  * @return value     : A string containing the value to be compared
  */
  objectValueExists : function (object, property, value) {
    for (const key in object) {
      const user = object[key];

      if(user[property] === value) {
        return true;
      }

    }
    return false;
  },

  /*
  * Takes a nested user object and checks if a username and password match
  * @param  object  : A nested object containing user data const object = { "someObject" : {property1: "some value"...}}
  * @return value   : Returns user id if object is matched, otherwise false
  */
  checkEmailPasswordMatch : function (object, email, password, bcrypt) { 
    for (const key in object) {
      const user = object[key];
      const hashedPassword = user.password ;

      if((user.email === email) && (bcrypt.compareSync(password, hashedPassword))) {
        return user.id;
      }
    }
    return false;
  }
}

