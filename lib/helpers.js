function generateRandomString() {
  const length = 6; 
  console.log(Math.random().toString(36).replace('0.', '').substr(0, length));
}
