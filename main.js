import Tracker from './Tracker';

export default TrackerReact = function (Component) {
  if (Meteor.isServer) return Component;

  class TrackerReact extends Component {

    constructor(...args) {
      super(...args);
      console.log("TrackerReact engaged!");
      this.autorunRender();
    }

    componentWillUnmount() {
      this._renderComputation.stop();
      this._renderComputation = null;
    }

    //The magic behind this computation is it only ever runs once after each time `render` is called.
    //When it does run that 2nd time, it's used just to force an update. The reactive function it wraps isn't even called.
    //Then on the update, the cycle repeats, and the computation is stopped, and a new one is made.
    //Also, because the autorun is recreated on all React-triggered re-renders, any new code-paths possibly
    //taken in `render` will automatically begin tracking reactive dependencies, thereby MERGING both models of reactivity:
    //Meteor's various reactive data sources AND React's functional + unidirectional re-running of
    //everything in component branches with state changes.
    autorunRender() {
      let oldRender = this.render;

      this.render = () => {
        // simple method we can offer in the `Meteor.Component` API
        return this.autorunOnce('_renderComputation', oldRender);
      };
    }

    autorunOnce(name, dataFunc) {
      return Tracker.once(name, this, dataFunc, this.forceUpdate);
    }
  }

  return TrackerReact;
};