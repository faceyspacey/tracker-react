// Also available as a global
import {Tracker} from 'meteor/tracker';

/**
 * Create "one-time" reactive computations with Tracker
 * @param name {string} Component Reactive Data Property for Computation
 * @param context {*} Target Component Instance
 * @param dataFunc {*} Data Context
 * @param updateFunc {*} Component ForceUpdate Method - To re-trigger render function
 * @param mode {object} Profiler Config Object
 * @param profiler {object} Profiler
 * @returns {*} Symbol(react.element) - Result data-element composition
 */
Tracker.once = function (name, context, dataFunc, updateFunc, mode, profiler) {
  let data;

  if (profiler && context._renderComputation) {
    profiler.time(mode, 1, context.constructor.name);
  }

  // Stop it just in case the autorun never re-ran
  if (context[name] && !context[name].stopped) context[name].stop();

  if (profiler && !context._renderComputation) {
    profiler.log(mode, 1, context.constructor.name);
  }

  // NOTE: we may want to run this code in `setTimeout(func, 0)` so it doesn't impact the rendering phase at all
  context[name] = Tracker.nonreactive(() => {
    return Tracker.autorun(c => {
      if (c.firstRun) {

        if (profiler && context._renderComputation) {
          profiler.log(mode, 3, context.constructor.name, context._renderComputation);
        }

        data = dataFunc.call(context);

      } else {

        profiler && profiler.group(mode, 0, context.constructor.name);
        profiler && profiler.log(mode, 2, context.constructor.name);

        // Stop autorun here so rendering "phase" doesn't have extra work of also stopping autoruns; likely not too
        // important though.
        if (context[name]) context[name].stop();

        // where `forceUpdate` will be called in above implementation
        updateFunc.call(context);
      }
    });
  });

  return data;
};

export default Tracker