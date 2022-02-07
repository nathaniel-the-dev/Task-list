<template>
	<div class="settings__overlay" @click.self="resetValues">
		<div class="settings__container">
			<div class="settings__header">
				<h1>Settings</h1>
				<button class="settings__button--close" @click="resetValues">
					<svg width="16" height="16" viewBox="0 0 16 16"><use href="../assets/icons/close.svg#icon" /></svg>
				</button>
			</div>

			<div class="app--version__container">
				<h5>Version {{ version }}</h5>
			</div>

			<form @submit.prevent="getOptions" class="settings__body">
				<div class="input__group">
					<h2>General</h2>

					<input type="checkbox" id="tray" v-model="newOptions.minimizeToTray.enabled" />
					<label for="tray">Minimize to tray on close</label>
				</div>

				<div class="input__group">
					<h2>Notifications</h2>

					<input type="checkbox" id="notifications" v-model="newOptions.notifications.enabled" />
					<label for="notifications">Enable notifications</label>

					<br />
					<label for="notificationFrequency" v-show="newOptions.notifications.enabled">How often do you want notifications?</label>
					<select id="notificationFrequency" v-show="newOptions.notifications.enabled" v-model="newOptions.notifications.frequency">
						<option value="3600000" selected>Every Hour</option>
						<option value="86400000">Everyday</option>
						<option value="259200000">Every 3 Days</option>
						<option value="604800000">Every Week</option>
					</select>
				</div>

				<div class="input__group">
					<h2>Updates</h2>

					<input type="checkbox" id="updates" v-model="newOptions.updates.onStartup" />
					<label for="updates">Check for updates on startup</label>
				</div>

				<div class="input__buttons">
					<button type="submit">Save changes</button>
					<button type="reset" @click="resetValues">Cancel</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
	import { ipcRenderer } from 'electron';

	export default {
		name: 'Settings',
		props: ['options', 'version'],

		beforeMount() {
			this.newOptions = JSON.parse(JSON.stringify(this.options));
		},

		data() {
			return {
				newOptions: {},
			};
		},

		methods: {
			getOptions() {
				// Update settings
				const options = JSON.parse(JSON.stringify(this.newOptions));
				ipcRenderer.sendSync('updateSettings', JSON.stringify(options));

				// Update UI
				this.$emit('closeSettings');
			},

			resetValues() {
				this.newOptions = JSON.parse(JSON.stringify(this.options));
				this.$emit('closeSettings');
			},
		},
	};
</script>

<style>
	.settings__overlay {
		background: hsla(0, 0%, 50%, 0.5);
		backdrop-filter: blur(2px);

		display: flex;
		align-items: center;
		justify-content: center;

		position: fixed;
		inset: 0;
		z-index: 10;
	}

	.settings__container {
		background: white;
		border-radius: 1rem;
		box-shadow: 0px 2px 5px black;

		font-family: 'Poppins', sans-serif;

		min-height: 50%;
		min-width: 50%;

		display: flex;
		flex-direction: column;

		overflow: hidden;
		user-select: none;
	}

	.settings__header {
		background: hsla(0, 0%, 75%, 0.5);

		width: 100%;

		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.settings__header h1 {
		font-weight: 600;
		text-transform: uppercase;

		margin: 1rem 0 0.5rem 2rem;
	}

	.settings__header button {
		background: none;
		border: none;
		outline: none;
		border-radius: 50%;

		margin-right: 2rem;
		padding: 0.5rem;

		display: flex;
		align-items: center;
		justify-content: center;

		transition: all 0.2s ease;

		cursor: pointer;
	}
	.settings__header button:hover {
		background: hsl(0, 0%, 80%);
	}
	.settings__header button:hover use {
		color: hsl(0, 100%, 50%);
	}

	.settings__body {
		padding: 1rem 2rem;
	}

	.settings__body h2 {
		font-weight: 500;
		margin: 0;
	}

	.settings__body .input__group {
		margin-bottom: 1rem;
	}
	.settings__body .input__group > :not(*:first-child) {
		margin-left: 1rem;
	}

	.settings__body .input__group :is(input, select) {
		border: 1px solid hsl(0, 0%, 75%);
		outline: none;

		margin-top: 0.5rem;

		cursor: pointer;
	}
	.settings__body .input__group :is(input, select):focus {
		box-shadow: 0 0 2px black;
	}
	.settings__body .input__group input + label {
		margin-left: 0.5rem !important;
		cursor: pointer;
	}

	.settings__body .input__buttons {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.settings__body .input__buttons button {
		background: hsl(0, 0%, 95%);
		border: 1px solid hsl(0, 0%, 75%);
		border-radius: 0.5em;
		outline: none;

		font-family: 'Nunito', sans-serif;
		font-weight: 600;
		text-transform: uppercase;

		padding: 0.5em;

		transition: all 0.4s ease;

		cursor: pointer;
	}
	.settings__body .input__buttons button[type='submit']:hover {
		background: hsl(120, 100%, 85%);
	}
	.settings__body .input__buttons button[type='reset']:hover {
		background: hsl(0, 100%, 85%);
	}

	.app--version__container :is(h4, h5, h6) {
		margin: 0 2rem;

		/* display: none; */
	}
</style>
