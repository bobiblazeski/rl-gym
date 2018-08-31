const randInt = n => Math.floor(Math.random()*n);
const between = (n, min, max) => min <= n && n < max;

export { randInt, between };