/**
 * Tracker is available as a global variable but is extended for one time computations/invalidation.
 * Implementation: See ./Tracker.js
 */
import Tracker from './Tracker';

/**
 * autorunRender(): The magic behind this computation is it only ever runs once after each time `render` is called.
 * When it does run that 2nd time, it's used just to force an update. The reactive function it wraps isn't even called.
 * Then on the update, the cycle repeats, and the computation is stopped, and a new one is made.
 *
 * Also, because the autorun is recreated on all React-triggered re-renders, any new code-paths possibly
 * taken in `render` will automatically begin tracking reactive dependencies, thereby MERGING both models of reactivity:
 * Meteor's various reactive data sources AND React's functional + unidirectional re-running of
 * everything in component branches with state changes.
 */


/**
 * Default. Provides a react component for inheritance as a clean alternative to mixins.
 * Implementation:
 *    "class MyApp extends TrackerReact(React.Component) { (...)"
 * @param Component {*} React Component
 */
export default TrackerReact = function (Component, opt) {
  // No reactive computations needed for Server Side Rendering
  if (Meteor.isServer) return Component;

  class TrackerReactComponent extends Component {

    constructor(...args) {
      super(...args);

      /*
       Overloading the constructors `componentWillUnmount` method to ensure that computations are stopped and a
       forceUpdate prevented, without overwriting the prototype. This is a potential bug, as of React 14.7 the
       componentWillUnmount() method does not fire, if the top level component has one. It gets overwritten. This
       implementation is however similar to what a transpiler would do anyway.

       GitHub Issue: https://github.com/facebook/react/issues/6162
       */
      if (!this.constructor.prototype._isExtended) {
        this.constructor.prototype._isExtended = true;
        let superComponentWillUnmount = this.constructor.prototype.componentWillUnmount;

        this.constructor.prototype.componentWillUnmount = function (...args) {
          if (superComponentWillUnmount) {
            superComponentWillUnmount.call(this, ...args);
          }

          this._renderComputation.stop();
          this._renderComputation = null;
        };
      }

      this.autorunRender();
    }

    autorunRender() {
      let oldRender = this.render;

      this.render = () => {
        // Simple method we can offer in the `Meteor.Component` API
        return this.autorunOnce('_renderComputation', oldRender);
      };
    }

    autorunOnce(name, dataFunc) {
      return Tracker.once(name, this, dataFunc, this.forceUpdate);
    }
  }

  return TrackerReactComponent;
};


/**
 * Mixin. Use with ES7 / TypeScript Decorator or Mixin-Module.
 * Implementation:
 *   "@TrackerReactMixin
 *    class MyApp extends React.Component { (...)"
 * @type {{componentWillMount: (function()), componentWillUnmount: (function()), autorunRender: (function()),
 *   autorunOnce: (function(*=, *=))}}
 */
export const TrackerReactMixin = {
  componentWillMount() {
    // No reactive computations needed for Server Side Rendering
    if (Meteor.isServer) return;

    this.autorunRender();
  },
  componentWillUnmount() {
    // No reactive computations needed for Server Side Rendering
    if (Meteor.isServer) return;

    this._renderComputation.stop();
    this._renderComputation = null;
  },
  autorunRender() {
    let oldRender = this.render;

    this.render = () => {
      // Simple method we can offer in the `Meteor.Component` API
      return this.autorunOnce('_renderComputation', oldRender);
    };
  },
  autorunOnce(name, dataFunc) {
    return Tracker.once(name, this, dataFunc, this.forceUpdate);
  }
};
