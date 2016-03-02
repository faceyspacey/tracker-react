/**
 * Profiler. Used to
 */

export let mode = {
  profiler: false
};

export let profiler = {
  log: function TrackerReactLog(mode, layer, name, stack) {
    if (!mode.profiler) return;

    const con = mode.logger ? mode.logger : console;

    switch (layer) {
      case 0:
        con.log('%cTrackerReact %c(%s): Mounting Meteor Reactive Component',
          'color: #1866B8; font-weight: bold; font-style: italic',
          'color: black; font-weight: bold',
          name);
        break;
      case 1:
        con.log("%c%s",
          'color: #1866B8',
          name,
          "First time check for data");
        break;
      case 2:
        con.log("%c%s",
          'color: #1866B8',
          name,
          'Change detected (invalidation)');
        break;
      case 3:
        con.log("%c%s",
          'color: #1866B8',
          name,
          "Data up-to-date (computation stopped)",
          stack);
        break;
      case 4:
        con.log('%cTrackerReact %c(%s): Un-Mounting Meteor Reactive Component',
          'color: #1866B8; font-weight: bold; font-style: italic; text-decoration: line-through',
          'color: black; font-weight: bold',
          name);
        break;
    }
  },
  time: function TrackerReactTimer(mode, layer, name) {
    if (!mode.profiler) return;

    const con = mode.logger ? mode.logger : console;

    switch (layer) {
      case 0:
        con.time(name + " (initial to DOM)");
        break;
      case 1:
        con.time(name + " (reactivity to DOM)");
        break;
    }
  },
  timeEnd: function TrackerReactTimerEnd(mode, layer, name) {
    if (!mode.profiler) return;

    const con = mode.logger ? mode.logger : console;

    switch (layer) {
      case 0:
        con.timeEnd(name + " (initial to DOM)");
        break;
      case 1:
        con.timeEnd(name + " (reactivity to DOM)");
        break;
    }
  },
  group: function TrackerReactGroup(mode, layer, name) {
    if (!mode.profiler) return;

    const con = mode.logger ? mode.logger : console;

    switch (layer) {
      case 0:
        con.group('%cTrackerReact %c(%s): Reactive Update',
          'color: #1866B8; font-weight: bold; font-style: italic',
          'color: black; font-weight: bold', name);
        break;
    }
  },
  groupEnd: function TrackerReactGroupEnd(mode, layer, name) {
    if (!mode.profiler) return;

    const con = mode.logger ? mode.logger : console;

    switch (layer) {
      case 0:
        con.groupEnd('%cTrackerReact %c(%s): Reactive Update',
          'color: #1866B8; font-weight: bold; font-style: italic',
          'color: black; font-weight: bold', name);
        break;
    }
  }
};