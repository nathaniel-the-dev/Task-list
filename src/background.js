'use strict';

import path from 'path';
import fs from 'fs';
import { app, protocol, BrowserWindow, Menu, Tray, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

let mainWindow, tray;
let firstLoad = true;

let minimizeToTray, updates;

function createTray() {
	try {
		// Create tray instance
		tray = new Tray(path.join(__static, 'favicon.png'));

		const menu = Menu.buildFromTemplate([
			{
				label: 'Open',
				toolTip: 'Open Task List',
				click() {
					mainWindow.show();
					tray.destroy();
				},
			},
			{
				label: 'Exit',
				toolTip: 'Exit Task List',
				click() {
					app.exit();
				},
			},
		]);

		// Tray variables
		tray.setToolTip('Task List');
		tray.setContextMenu(menu);

		// Tray actions
		tray.on('double-click', () => {
			mainWindow.show();
			tray.destroy();
		});

		if (firstLoad) {
			tray.displayBalloon({ iconType: 'info', title: 'Task List', content: 'App minimized to tray' });
			firstLoad = false;
		}
	} catch (error) {
		console.error(error);
	}
}
function updateSettings(settings) {
	// Update values
	const options = JSON.parse(settings);
	minimizeToTray = options.minimizeToTray;
	updates = options.updates;

	// Send settings to app
	mainWindow.webContents.send('loadSettings', options, app.getVersion());
}

function checkForUpdates() {
	// Check if enabled
	if (!updates || !updates.enabled) return;
}

function closeToTray(e) {
	// Check if enabled
	if (!minimizeToTray || !minimizeToTray.enabled) return;

	// Prevent default action
	e.preventDefault();

	// Create tray icon
	createTray();

	// Hide window
	mainWindow.hide();
}

async function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		backgroundColor: '#00000017',
		minWidth: 1280,
		minHeight: 720,
		icon: path.join(__static, 'favicon.png'),

		autoHideMenuBar: true,
		show: false,

		webPreferences: {
			// Use pluginOptions.nodeIntegration, leave this alone
			// See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
		},
	});

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
		if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		mainWindow.loadURL('app://./index.html');
	}

	if (!isDevelopment) Menu.setApplicationMenu(null);

	mainWindow.maximize();
	mainWindow.on('close', closeToTray);
	mainWindow.on('ready-to-show', () => {
		// Show window
		mainWindow.show();

		// Load settings
		const settings = fs.readFileSync(path.join(__static, 'json/settings.json'), { encoding: 'utf8' });

		// Apply changes
		updateSettings(settings);
	});
}

// Check for updates
checkForUpdates();

// Update settings
ipcMain.on('updateSettings', (ev, settings) => {
	// Apply changes
	updateSettings(settings);

	// Save file
	if (!isDevelopment) {
		fs.writeFileSync(path.join(__static, 'json/settings.json'), settings, { encoding: 'utf8' });

		console.log('Settings saved');
	}

	ev.returnValue = true;
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS3_DEVTOOLS);
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString());
		}
	}
	createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit();
			}
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}
