<template>
	<div>
		<form class="input--form" :class="{ focused: focused }" @focus.capture="focused = true" @blur.capture="focused = false" @submit.prevent="handleSubmit($event)">
			<input class="input__name" type="text" v-model="task.name" maxlength="255" placeholder="Title (eg. Set an alarm)" title="Enter a task" autofocus required />

			<div class="input__date--container" :class="{ focused: dateFocused }" @focus.capture="dateFocused = true" @blur.capture="dateFocused = false" @click="$refs.dueDate.focus()">
				<label class="input__date--label" :class="{ userInput: $refs.dueDate?.value }">Due</label>
				<input class="input__date" type="date" ref="dueDate" v-model="task.dueDate" :class="{ userInput: $refs.dueDate?.value }" :min="minDate" title="Set a due date" />
			</div>

			<input class="input__points" type="number" v-model="task.points" min="0" max="10000" placeholder="Points (eg. 1000)" title="Enter an number of points" />

			<select class="input__category" ref="category" v-model="task.category" :class="{ userInput: $refs.category?.value }" title="Select a category">
				<option value="" selected disabled hidden>Category</option>
				<option value="school">School🏫</option>
				<option value="church">Church⛪</option>
				<option value="other">Other</option>
			</select>

			<button class="input__btn" type="submit" title="Add task">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="35" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg>
			</button>
		</form>
	</div>
</template>

<script>
	import { v4 as uuidv4 } from 'uuid';

	export default {
		name: 'TaskInput',

		data() {
			return {
				// Task varibles
				task: {
					name: '',
					dueDate: '',
					category: '',
					points: '',
				},
				now: new Date(),

				// UI Variables
				focused: false,
				dateFocused: false,
			};
		},

		mounted() {
			setInterval(() => (this.now = new Date()));
		},

		methods: {
			handleSubmit(e) {
				// Get additional data
				this.task.id = uuidv4();
				this.task.name = this.task.name.trim();
				this.task.points = +this.task.points;
				this.task.category = !this.task.category ? 'other' : this.task.category;

				this.task.isFavourite = this.task.dueDate ? true : false;
				this.task.dueDate = this.task.dueDate ? new Date(this.task.dueDate) : '';

				this.task.dateCreated = new Date();

				// Send completed task object
				const taskObj = { ...this.task };
				this.$emit('addTask', taskObj);

				// Reset input fields
				this.task = {
					name: '',
					dueDate: '',
					category: '',
					points: '',
				};

				// Blur fields
				e.target.querySelector('input').blur();
				e.target.querySelector('select').blur();
			},
		},

		computed: {
			minDate() {
				return this.now.toISOString().slice(0, 10);
			},
		},
	};
</script>

<style>
	:root {
		--input-border-color: rgb(150, 150, 150);
		--input-background: rgb(175, 175, 175);
		--input-background-focused: rgb(190, 190, 190);
		--input-background-hover: rgb(185, 185, 185);
	}

	.input--form {
		background-color: var(--input-background);
		border-bottom: 1px solid var(--input-border-color);
		border-top-left-radius: 5px;
		border-top-right-radius: 5px;

		width: 100%;
		padding: 0;

		position: relative;

		display: grid;
		grid-template-columns: 45% 20% 15% 15% 5%;
		align-content: bottom;
		justify-items: stretch;

		user-select: none;
	}

	.input--form input,
	.input--form select,
	.input--form button {
		background-color: var(--input-background);
		border: none;
		outline: none;

		font-size: 16px;
		font-family: 'Poppins', sans-serif;

		height: 100%;
		width: 100%;
		padding: 0;
		margin: 0;

		transition: 150ms background ease-in;
	}
	.input--form .input__date--container,
	.input--form .input__points,
	.input--form .input__category,
	.input--form .input__btn {
		border-left: 1px solid rgb(150, 150, 150);
	}
	.input--form input.userInput,
	.input--form label.userInput,
	.input--form select.userInput {
		color: black;
		font-weight: 400;
	}

	.input--form input::-webkit-outer-spin-button,
	.input--form input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.input--form .input__name {
		border-top-left-radius: 5px;
		font-weight: 400;
		text-indent: 5px;
	}

	.input--form .input__date--container {
		height: 100%;
		padding: 0;
		cursor: text;

		display: flex;
		align-items: center;

		cursor: text;
	}

	.input--form .input__date--label {
		color: rgb(100, 100, 100);
		font-family: 'Poppins', sans-serif;
		font-size: 16px;

		height: 100%;
		padding: 0px 5px;

		display: flex;
		place-items: center;

		transition: background 0.15s ease-in;

		cursor: inherit;
	}

	.input--form .input__date {
		color: rgb(100, 100, 100);
		cursor: inherit;
	}

	.input--form .input__points {
		text-indent: 5px;
	}

	.input--form .input__category {
		color: rgb(100, 100, 100);
		font-weight: 400;
		cursor: pointer;
	}

	.input--form .input__category option {
		color: rgb(0, 0, 0);
	}

	.input--form .input__btn {
		border-top-right-radius: 5px;

		display: flex;
		align-items: center;
		justify-content: center;

		cursor: pointer;
	}

	.input--form .input__btn svg path {
		fill: rgb(15, 111, 255);
	}

	.input--form .input__btn:hover,
	.input--form .input__name:hover,
	.input--form .input__date--container:hover .input__date--label,
	.input--form .input__date--container:hover .input__date,
	.input--form .input__points:hover,
	.input--form .input__category:hover {
		background: var(--input-background-hover);
	}

	.input--form .input__name:focus,
	.input--form .input__points:focus,
	.input--form .input__date--container.focused .input__date--label,
	.input--form .input__date--container.focused .input__date,
	.input--form .input__btn:focus,
	.input--form .input__category:focus {
		background: var(--input-background-focused);
		border-bottom: 2px solid rgb(90, 90, 90);
		color: black;
		font-weight: 400;
	}

	.input--form .input__name:focus::placeholder,
	.input--form .input__date:focus::placeholder,
	.input--form .input__points:focus::placeholder {
		color: black;
		font-weight: 400;
	}
</style>
