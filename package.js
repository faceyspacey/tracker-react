Package.describe({
	name: "ultimatejs:tracker-react",
	summary: "Helper-level reactive methods",
	version: '0.0.7',
	documentation: 'README.md',
	git: 'https://github.com/ultimatejs/tracker-react'
});

Package.onUse(function (api) {
	api.versionsFrom('METEOR@1.2.1');
	api.use('tracker');
	api.use('underscore');
	api.use('ecmascript@0.1.5');
	
	api.addFiles('tracker-react-mixin.js');
	api.export('TrackerReact');
});

