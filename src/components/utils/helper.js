export function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
export function replaceUrls(value) {
    var text = value.replace(/<br\s*[\\/]?>/gi, " </br>").replace(/(https?:\/\/)(www\.)?([\S]*)/g, '<a href="$1$2$3" target="_blank">$1$2$3</a>');
    return text;
}
export function getRandom(x){
    return Math.floor(Math.random()*10)+1;
}

export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}