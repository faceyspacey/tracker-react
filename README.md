## TrackerReact

```
meteor add ultimatejs:tracker-react
```

This mixin is an upgrade to what `ReactMeteorData` offers. Using `TrackerReact` instead you are no longer required to "freeze" alll your reactivity in a single method. Any *reactive data sources* (e.g: `collection.find()` or `Session.get('foo')`) used in your `render` method or by methods called by your `render` method are automatically reactive! This replicates the standard helper experience from Meteor/Blaze. Enjoy!
 
GOTCHA: You must call `.fetch()` on your cursors to trigger reactivity!!

## EXAMPLE:

```
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

----
###An example app has been prepared to quickly test it. 
Give it a try: https://github.com/ultimatejs/tracker-react-todos-example

*Thanks for helping us bridge the Blaze world we know to what will be a delightful React future.* **Long Live Meteor!** *Stay tuned for more coming out of the* [***Sideburns***](https://github.com/timbrandin/blaze-react) and ***Blaze React*** *project. Pull requests welcome.*  

######FINAL NOTE: Take a look at the code. It's extremely simple. It's in one mixin file: `tracker-react-mixin.jsx`. It basically just wraps helper methods in autoruns. It happens to also be an important step in transpiling Blaze 1.0. To make the transition to React it's important we are informed. We can do this together.
