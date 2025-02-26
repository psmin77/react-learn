export function getFinalState(baseState, queue) {
  let finalState = baseState;

  // TODO: do something with the queue...
  for (let update of queue) {
    if (typeof update === "function") {
      finalState = update(finalState);
    } else {
      finalState = update;
    }
  }

  return finalState;
}
