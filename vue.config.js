module.exports = {
	pluginOptions: {
		electronBuilder: {
			nodeIntegration: true,
			contextIsolation: false,

			builderOptions: {
				productName: 'Task List',
				appId: 'com.electron.tasklist',
				icon: 'public/favicon.png',
				copyright: 'Copyright © 2021 Nathaniel Campbell',
			},
		},
	},
};
