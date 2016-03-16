Package.describe({
	name: "ultimatejs:tracker-react",
	summary: "No-Config reactive React Components with Meteor. Apply as composition, mixin or decorator.",
	version: '1.0.4',
	documentation: 'README.md',
	git: 'https://github.com/ultimatejs/tracker-react'
});

Package.onUse(function (api) {
	api.versionsFrom('METEOR@1.3-rc.1');
	api.use('tracker');
	api.use('underscore');
	api.use('ecmascript');
	
	api.mainModule('main.js');
});