module.exports = {

  generateRandomString : function () {
    const length = 6; 
    return Math.random().toString(36).replace('0.', '').substr(0, length);
  },

  /*
  * Takes a nested object and for a given property, checks if a value and determines if the value exists
  * in that object
  * object : const object = { "someObject" : {property1: "some value"...}}
  * property : string
  * value : string
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
  * object : const object = { "someObject" : {property1: "some value"...}}
  * value : string
  */
  checkEmailPasswordMatch : function (object, email, password) {

  for (const key in object) {
    const user = object[key];
    if((user.email === email) && (user.password === password)) {
      return user.id;
    }
  }
  return false;
  }
}

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
