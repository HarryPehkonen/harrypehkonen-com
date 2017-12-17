(function() {
  var states = [];
  const konami = [
    "START",
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
  ];
  document.querySelector("body").addEventListener("keyup", function(ev) {
    states.push(0);
    states = states
      .map(getNextState.bind(null, ev.key))
      .filter(isValidState)
    ;

    if (states.find(isWinningState) !== undefined) {
      easterEgg();
    }

    function getNextState(key, currState) {
      const nextState = currState + 1;
      return konami[nextState] === key ? nextState : null;
    }

    function isValidState(state) {
      return state !== null;
    }

    function isWinningState(state) {
      return state === konami.length - 1;
    }

    function easterEgg() {
      console.log("Yay!!!");
    }
  });
})();
