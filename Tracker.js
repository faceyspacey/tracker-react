// might as well abstract this pattern since something tells me we'll be using it a lot

Tracker.once = function (name, context, dataFunc, updateFunc) {
  let data;

  //stop it just in case the autorun never re-ran
  if (context[name] && !context[name].stopped) context[name].stop();

  //NOTE: we may want to run this code in `setTimeout(func, 0)` so it doesn't impact the rendering phase at all
  context[name] = Tracker.nonreactive(() => {
    return Tracker.autorun(c => {
      if (c.firstRun) data = dataFunc.call(context);
      else {

        //stop autorun here so rendering "phase" doesn't have extra work of also stopping autoruns; likely not too
        // important though.
        if (context[name]) context[name].stop();

        //where `forceUpdate` will be called in above implementation
        updateFunc.call(context);
      }
    });
  });

  return data;
};

export default Tracker