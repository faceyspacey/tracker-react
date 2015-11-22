TrackerReact = {}; //so server side rendering isn't broken
if(Meteor.isServer) return

TrackerReact = {
    componentWillMount() {
        this.bindReactiveMethods(); //make all reactive bindings every time a component mounts
		this.assignEvents();
        this._computations = {};
    },
    componentWillUnmount() {
        _.each(this._computations, c => c.stop());
        this._computations = null;
    },

	
    bindReactiveMethods() {
        let reg = /(^props|state|conext|getDOMNode|refs|events)$/; //`events` key will hold map of non-reactive event handlers

        _.each(this, function(func, prop) {
			//every other method on the component instance that doesn't start with `_` will be made reactive
            if(this.hasOwnProperty(prop) && prop.charAt(0) !== '_' && _.isFunction(this[prop]) 
				&& !TrackerReact.hasOwnProperty(prop) && !reg.test(prop)) {
					
                this.bindMethod(prop);
            }
        }, this);
    },
    bindMethod(prop) {
        let oldFunction = this[prop];

        this[prop] = function() {
            if(this._computations[prop]) this._computations[prop].stop(); //there will be a computation every re-run except the 1st
            let args = arguments,
                response;

			//The magic behind this computation is it only ever runs once after its first run.
			//When it does run that 2nd time, it's used just to force an update. The reactive function it wraps isn't even called.
			//Then on the update, the cycle repeats, and the computation is stopped, and a new one is made. 
            this._computations[prop] = Tracker.nonreactive(() => {
                return Tracker.autorun(c => {
                    if(c.firstRun) response = oldFunction.apply(this, args); 
                    else this.forceUpdate();
                });
            });

            return response;
        }.bind(this);
		
		window.MAIN = this;
    },
	
	
	//I'm opting to put events in a map, rather than helpers. In later versions, neither will need to be in nested maps
	//for reasons that will soon be clear when next round's features are added :)
	assignEvents() {
		let events = _.isFunction(this.events) ? this.events() : null;
		
		_.each(events, (handler, prop) => {
			if(_.isFunction(handler)) this[prop] = handler.bind(this);
		});
	}
};	
