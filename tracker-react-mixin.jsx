TrackerReact = {}; //so server side rendering isn't broken
if(Meteor.isServer) return;

TrackerReact = {
	componentWillMount() {
		this.autorunRender();
	},
	componentWillUnmount() {
		this._renderComputation.stop();
		this._renderComputation = null;
	},
	
	
	//The magic behind this computation is it only ever runs once after each time `render` is called.
	//When it does run that 2nd time, it's used just to force an update. The reactive function it wraps isn't even called.
	//Then on the update, the cycle repeats, and the computation is stopped, and a new one is made. 
	//Also, because the autorun is recreated on all React-triggered re-renders, any new code-paths possibly
	//taken in `render` will automatically begin tracking reactive dependencies, thereby MERGING both models of reactivity:
	//Meteor's various reactive data sources AND React's functional + unidirectional re-running of 
	//everything in component branches with state changes. 
	
	autorunRender(prop) {
		let oldRender = this.render;
	
		this.render = () => {
			return this.autorunOnce('_renderComputation', oldRender); //simple method we can offer in the `Meteor.Component` API
		};
	},
	autorunOnce(name, dataFunc) {
		return Tracker.once(name, this, dataFunc, this.forceUpdate);
	}
};	


//might as well abstract this pattern since something tells me we'll be using it a lot
Tracker.once = function(name, context, dataFunc, updateFunc) {
	let data;
		
	if(context[name] && !context[name].stopped) context[name].stop(); //stop it just in case the autorun never re-ran

	context[name] = Tracker.nonreactive(() => {
		return Tracker.autorun(c => {
    		if(c.firstRun) data = dataFunc.call(context); 
    		else {
				if(context[name]) context[name].stop(); //stop autorun here so rendering "phase" doesn't have extra work of also stopping autoruns; likely not too important though.
				updateFunc.call(context); //where `forceUpdate` will be called in above implementation 
			}
		});
	});
	
	return data;
};
