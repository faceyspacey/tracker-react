TrackerReact = {}; //so server side rendering isn't broken
if (Meteor.isServer) return;

TrackerReact = {
    componentWillMount: function() {
        this.autorunRender();
				
				TrackerReact.nodes[this._reactId()] = this;
    },
    componentWillUnmount: function() {
        this._renderComputation.stop();
        this._renderComputation = null;
				
				delete TrackerReact.nodes[this._reactId()];		
				this.unbindEvents();
    },


    //The magic behind this computation is it only ever runs once after each time `render` is called.
    //When it does run that 2nd time, it's used just to force an update. The reactive function it wraps isn't even called.
    //Then on the update, the cycle repeats, and the computation is stopped, and a new one is made. 
    //Also, because the autorun is recreated on all React-triggered re-renders, any new code-paths possibly
    //taken in `render` will automatically begin tracking reactive dependencies, thereby MERGING both models of reactivity:
    //Meteor's various reactive data sources AND React's functional + unidirectional re-running of 
    //everything in component branches with state changes. 

    autorunRender: function(prop) {
        let oldRender = this.render;

        this.render = () => {
						console.log('OLD RENDER')
            return this.autorunOnce('_renderComputation', oldRender); //simple method we can offer in the `Meteor.Component` API
        };
    },
    autorunOnce: function(name, dataFunc) {
        return Tracker.once(name, this, dataFunc, this.forceUpdate);
    },
		
		
		
		
		componentDidUpdate: function() {
			this.unbindEvents();
	    this.bindEvents();
	  },
		bindEvents: function() {
			_.each(this.events(), (handler, key) => {
				let [event, selector] = this._eventAndSelector(key);
				let $el = $(selector, ReactDOM.findDOMNode(this));
				let self = this;
				
        $el.bind(event+'.'+this._reactId(), function(e) {
					let component = self._findComponent($(this));
					self._applyWithProps(self, handler, [e], component.props);
					//return handler.apply(component, [e]); 	
        });
			});
	  },
		unbindEvents: function() {
			_.each(this.events(), function(handler, key) {
				let [event] = this._eventAndSelector(key);
				$el.unbind(event+'.'+this._reactId());
			});
		},
		
		
		_findComponent: function($el) {
			let reactId;
			
			while(!component && $el.length !== 0) {
				reactId = $el.data('reactid');
				
				if(TrackerReact.nodes[reactId]) return TrackerReact.nodes[reactId]; //component exists for reactId
				else $el = $el.closest('[data-reactid]'); //reactId corresponds to non-component element; find parent instead
			};
		},
		
		
		_eventAndSelector: function(key) {
			return key.trim().split(/\s(.+)?/);
		},
	 	_eventsRegex: /^(click|dblclick|focus|blur|change|mouseenter|mouseleave|mousedown|mouseup|keydown|keypress|keyup|touchdown|touchmove|touchup)(\s|$)/,
		_isEvent: function(method, name) {
			return this._eventsRegex.test(name) && _.isFunction(method);
		},
		
		events: function() {
			return _.filter(this.proto(), this._isEvent);
		},
		_reactId: function() {
			return this._reactInternalInstance && this._reactInternalInstance._rootNodeID;
		},
		proto: function() {
			return Object.getPrototypeOf(this);
		},
		
		
		__lookup: function(prop, args) {
			let component = this;
			let method;
			
			//climb component tree backwards to find first component that defines method:
			while(component && !method) { 
				if(component[prop]) method = component[prop]; //component has method 
				else component = component.props.__parent; 		//or we climb to next parent
			}
			
			return method ? this._applyWithProps(component || {}, method) : ''; //dont return `undefined` in templates
		},
		_applyWithProps: function(component, method, args, props) {
			let oldProps = component.props; 					//swap props to Blaze helper/event context
			component.props = props || this.props; 		//supplied props from event || components props for helper
			let ret = method.apply(component, args); 	//gather return value
			component.props = oldProps; 							//put props back for other methods to utilize like normal
			
			return ret;
		}
};


//might as well abstract this pattern since something tells me we'll be using it a lot
Tracker.once = function(name, context, dataFunc, updateFunc) {
    let data;

    if (context[name] && !context[name].stopped) context[name].stop(); //stop it just in case the autorun never re-ran

    context[name] = Tracker.nonreactive(() => { 						//NOTE: we may want to run this code in `setTimeout(func, 0)` so it doesn't impact the rendering phase at all
        return Tracker.autorun(c => {
            if (c.firstRun) data = dataFunc.call(context);
            else {
                if (context[name]) context[name].stop(); 		//stop autorun here so rendering "phase" doesn't have extra work of also stopping autoruns; likely not too important though.
                updateFunc.call(context); 									//where `forceUpdate` will be called in above implementation 
            }
        });
    });

    return data;
};