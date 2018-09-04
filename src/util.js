const randInt = (n) => Math.floor(Math.random()*n);
const between = (n, min, max) => min <= n && n < max;
const deepCopy = (o) => JSON.parse(JSON.stringify(o));
const cloneMatrix = (m) => m.map((arr) => arr.slice(0));

const step = (observation, reward, done, info) => ({
  observation: deepCopy(observation), reward, done, info,
});

export {
  between,
  cloneMatrix,
  deepCopy,
  randInt,
  step
};
