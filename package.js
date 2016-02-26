Package.describe({
	name: "ultimatejs:tracker-react",
	summary: "Helper-level reactive methods",
	version: '1.0.0',
	documentation: 'README.md',
	git: 'https://github.com/ultimatejs/tracker-react'
});

Package.onUse(function (api) {
	api.versionsFrom('METEOR@1.3-beta.11');
	api.use('tracker');
	api.use('underscore');
	api.use('ecmascript@0.4.0-beta.11');
	
	api.mainModule('main.js');
});

