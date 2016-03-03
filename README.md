![image](https://cloud.githubusercontent.com/assets/2397125/13386784/90369cda-deb0-11e5-8900-f13660467cd1.png)
##### Meteor 1.3
```
meteor add ultimatejs:tracker-react
```
##### Meteor 1.2

```
meteor add ultimatejs:tracker-react@0.0.6
```
TrackerReact is an upgrade to what `ReactMeteorData` offers. Using `TrackerReact` instead you are no longer required to "freeze" all your reactivity in a single method. Any *reactive data sources* (e.g: `collection.find()` or `Session.get('foo')`) used in your `render` method or by methods called by your `render` method are automatically reactive! This replicates the standard helper experience from Meteor/Blaze. Enjoy!

GOTCHA: You must call `.fetch()` on your cursors to trigger reactivity!!

## Usage
From **Meteor v.1.3-Beta11 and up**, react components can be made reactive either by using TrackerReact in a *Composition (inheritance)*, as *Mixin* or as *Decorator*.

#### Example-App
Clone & Read the Source: https://github.com/D1no/TrackerReact-Example

![trackerreact-demo](https://cloud.githubusercontent.com/assets/2397125/13449628/b715eee0-e02d-11e5-9e62-2397397836d5.gif)
#### Profiling
*Currently only under the `profiler` brench*
Use the profiler argument `TrackerReact(React.Component, {profiler: true})` to see render times of a reactive components. Or set `this._profMode = {profiler: true}` within the `constructor()` function.

#### Implementation
**Composition** (wrapping a relevant React.Component in TrackerReact) is a clean, default alternative until Meteor supports decorators.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// TrackerReact is imported (default) with Meteor 1.3 new module system
import TrackerReact from 'meteor/ultimatejs:tracker-react';

// Get the Collection
Tasks = new Mongo.Collection("tasks");

// > React.Component is simply wrapped with TrackerReact
class App extends TrackerReact(React.Component) {

	// Note: In ES6, constructor() === componentWillMount() in React ES5
	constructor() {
		super();
		this.state = {
          subscription: {
            tasks: Meteor.subscribe('tasks')
          }
        }
	}
	
	componentWillUnmount() {
		this.state.subscription.tasks.stop();
	}
	
	//tracker-based reactivity in action, no need for `getMeteorData`!
	tasks() {
	    return Tasks.find({}).fetch(); //fetch must be called to trigger reactivity
	},
	

	render() {
		return (
			<div className="container">
				<h1>
					Todo List - {Session.get('title')}
				</h1>

				<ul>
				  	{this.tasks().map((task) => {
						  return <Task key={task._id} task={task} />;
					  })}
				</ul>
			</div>
		);
	}
});
```

Same is possible **as Mixin** (ES6 example)

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// Use ReactMixin from npm
import ReactMixin from 'react-mixin';

// > Make sure to import the TrackerReactMixin export
import {TrackerReactMixin} from 'meteor/ultimatejs:tracker-react';

// Get the Collection
Tasks = new Mongo.Collection("tasks");

class App extends React.Component {

	// (...)

});
// > Using ReactMixin 
ReactMixin(App.prototype, TrackerReactMixin);
```

Same example **as Decorator** (ES6/ES7 Example).
Cleanest solution: Requires support for decorators either setting babel to experimental or TypeScript with experimental ES7 features turned on.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';

// > Make sure to import the TrackerReactMixin export
import {TrackerReactMixin} from 'meteor/ultimatejs:tracker-react';

// Get the Collection
Tasks = new Mongo.Collection("tasks");

// > Assign as Decorator
@TrackerReactMixin
class App extends React.Component {

	// (...)
```

#### Old Example: Meteor 1.2
Package version: `ultimatejs:tracker-react@0.0.6`
```jsx
App = React.createClass({
	mixins: [TrackerReact],

	//tracker-based reactivity in action, no need for `getMeteorData`!
	tasks() {
	    return Tasks.find({}).fetch(); //fetch must be called to trigger reactivity
	},
	

	render() {
		return (
			<div className="container">
				<h1>
					Todo List - {Session.get('title')}
				</h1>

				<ul>
				  	{this.tasks().map((task) => {
						  return <Task key={task._id} task={task} />;
					  })}
				</ul>
			</div>
		);
	}
});
```
