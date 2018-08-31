# rl-gym

A toolkit for developing and comparing reinforcement learning algorithms in JavaScript

## Basics


There are two basic concepts in reinforcement learning: the
environment (namely, the outside world) and the agent (namely, the
algorithm you are writing). The agent sends `actions` to the
environment, and the environment replies with `observations` and
`rewards` (that is, a score).

The following are the ``Env`` methods you
should know:

- `reset()`: Reset the environment's state. Returns `observation`, `reward`, `done`, `info`.
- `step(action)`: Step the environment by one timestep. Returns `observation`, `reward`, `done`, `info`.
- `render()`: Render one frame of the environment. The default mode will do something human friendly, such as pop up a window. Passing the `close` flag signals the renderer to close any such windows.


## Environments
### Tic-tac-toe
Environment for playing Tic-tac-toe game against agent playing randomly.
#### Simple

```javascript
// Create Tic-tac-toe environment
const env = gym.make('TicTacToe');
// Retrieve action space
const actionSpace = env.getActionSpace();
// Play 3 episodes choosing random actions
for (let i = 0; i < 3; ++i) {
    let step = 0;
    let {observation, reward, done, info} = env.reset();
    do {
        ({observation, reward, done, info} = env.step(actionSpace.sample()));
        console.log(`Episode ${i} Step ${++step}`);
        console.log(`=> Reward ${reward} Done: ${done} Info: ${info.text}`);
        env.render();
    } while (!done);
}
```