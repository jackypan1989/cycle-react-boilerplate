const Cycle = require('cycle-react');
const React = require('react');
const ReactDOM = require('react-dom');
const Rx = require('rx');

const Hello = Cycle.component('Hello', function computer(interactions) {
  return interactions.get('OnNameChanged')
    .map(ev => ev.target.value)
    .startWith('')
    .map(name =>
      <div>
        <label>Name:</label>
        <input type="text" onChange={interactions.listener('OnNameChanged')} />
        <hr />
        <h1>Hello {name}</h1>
      </div>
    );
});

ReactDOM.render(
  <Hello />,
  document.querySelector('#app')
);

if (module.hot) {
  module.hot.accept();
}