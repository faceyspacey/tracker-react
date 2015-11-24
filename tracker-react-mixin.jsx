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
			let response;
		
			if(this._renderComputation) this._renderComputation.stop(); //there will be a computation every re-run except the 1st
			
			this._renderComputation = Tracker.nonreactive(() => {
				return Tracker.autorun(c => {
			    		if(c.firstRun) response = oldRender.call(this); 
			    		else this.forceUpdate();
				});
			});
			
		    return response;
		};
	}
};	
