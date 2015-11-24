Package.describe({
	name: "ultimatejs:tracker-react",
	summary: "Helper-level reactive methods",
	version: '0.0.5',
	documentation: 'README.md',
	git: 'https://github.com/ultimatejs/tracker-react'
});

Package.onUse(function (api) {
	api.versionsFrom('METEOR@1.2.0.2');
	api.use('tracker');
	api.use('underscore');
	api.use('jsx@0.2.3');

	api.addFiles('tracker-react-mixin.jsx');
	api.export('TrackerReact');
});

