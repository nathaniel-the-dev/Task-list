<template>
	<transition name="menu">
		<nav class="navbar">
			<ul class="nav--links">
				<div>By Status</div>
				<li class="nav" :class="{ selected: link.selected }" v-for="(link, index) in navLinks" :key="index" @click="selectLink(index)">{{ link.title }}</li>

				<div>By Category</div>
				<li class="nav category__nav" :class="{ selected: link.selected }" v-for="(link, index) in navLinksByCategory" :key="index" @click="selectLinkByCat(index)">
					<p class="category__title" :style="{ color: link.color }">{{ link.title }}</p>

					<button class="control__btn delete--category" title="Delete category" @click="removeCategory(index)">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
							<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
						</svg>
					</button>
				</li>

				<form class="category__form" ref="categoryForm" hidden="true" @submit.prevent="addCategory">
					<div class="category__inputs">
						<input type="text" title="Enter a title" :placeholder="`eg. ${randomPlaceholder}`" maxlength="10" required />
						<input type="color" title="Pick a theme color" list="presetColors" />
					</div>

					<div class="category__buttons">
						<button type="submit">Add</button>
						<button type="reset" @click="hideCategoryInput">Cancel</button>
					</div>

					<datalist id="presetColors" hidden>
						<option value="#000000" selected></option>
						<option value="#ff0000"></option>
						<option value="#ffff00"></option>
						<option value="#00ff00"></option>
						<option value="#0000ff"></option>
						<option value="#ff00ff"></option>
					</datalist>
				</form>
				<button class="nav control__btn add--category" title="Add a category" @click="showCategoryInput">Add Category</button>
			</ul>

			<button class="nav control__btn settings" @click="openSettingsMenu">
				<svg width="20" height="20" viewBox="0 0 16 16"><use href="../assets/icons/gear.svg#icon" /></svg>
				Settings
			</button>
		</nav>
	</transition>
</template>

<script>
	export default {
		name: 'Navbar',

		mounted() {
			// Get custom categories
			this.navLinksByCategory = JSON.parse(localStorage.getItem('categories')) || [];
			this.$emit('updateCategories', this.navLinksByCategory);
		},

		data() {
			return {
				// Navbar variables
				navLinks: [
					{ title: '📄All', value: '', selected: true },
					{ title: '⌚Pending', value: 'pending', selected: false },
					{ title: '👍🏽Complete', value: 'complete', selected: false },
					{ title: '⭐Important', value: 'important', selected: false },
				],

				navLinksByCategory: [],
			};
		},

		methods: {
			showCategoryInput() {
				this.$refs.categoryForm.hidden = false;
				this.$refs.categoryForm.querySelector(`input[type="text"]`).focus();
			},

			hideCategoryInput() {
				this.$refs.categoryForm.hidden = true;
			},

			addCategory(e) {
				// Get input values
				const title = this._toSentenceCase(e.target.querySelector(`input[type="text"]`).value);
				const color = e.target.querySelector(`input[type="color"]`).value || '#000000';

				// Create category
				const newCategory = { title, value: title.trim().toLowerCase(), color, selected: false };

				// Add category
				this.navLinksByCategory.push(newCategory);

				// Update storage
				localStorage.setItem('categories', JSON.stringify(this.navLinksByCategory));

				// Update UI
				e.target.querySelector(`input[type="text"]`).value = '';
				e.target.querySelector(`input[type="color"]`).value = '#000000';
				this.$refs.categoryForm.hidden = true;
				this.$refs.categoryForm.blur();
			},

			removeCategory(index) {
				// Set task category to default
				this.$emit('setCategoryDefault', this.navLinksByCategory[index]);

				// Remove category
				this.navLinksByCategory.splice(index, 1);

				// Update storage
				localStorage.setItem('categories', JSON.stringify(this.navLinksByCategory));
			},

			selectLink(index) {
				const link = this.navLinks[index];

				if (link.selected) return;

				this.navLinks.forEach((lnk) => {
					if (lnk.value != link.value) lnk.selected = false;
					else lnk.selected = true;
				});

				this.$emit('sort', [this.navLinks, this.navLinksByCategory]);
			},

			selectLinkByCat(index) {
				const link = this.navLinksByCategory[index];
				if (!link) return;

				link.selected = !link.selected;

				this.$emit('sort', [this.navLinks, this.navLinksByCategory]);
			},

			openSettingsMenu() {
				this.$emit('openSettings');
			},

			_toSentenceCase(text) {
				return text.replace(/\b\w/g, (c) => c.toUpperCase());
			},
		},

		computed: {
			randomPlaceholder() {
				const possibleValues = ['Work', 'School', 'Family', 'Personal'];
				const randomIndex = Math.floor(Math.random() * possibleValues.length);

				return possibleValues[randomIndex];
			},
		},
	};
</script>

<style>
	/* Navbar */
	.navbar {
		color: rgb(39, 39, 39);
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(3px);

		height: calc(100% - 50px);
		width: var(--nav-length);
		margin: 0;

		display: flex;
		flex-direction: column;
		justify-content: space-between;

		overflow: hidden;
		user-select: none;
	}

	/* Nav List */
	.nav--links {
		font-family: 'Nunito', sans-serif;
		font-weight: 400;
		font-size: 18px;

		margin: 0;
		padding: 0;

		list-style: none;
	}

	/* Nav Links */
	.nav {
		padding: 3px 0 3px 10px;

		cursor: pointer;

		transition: 200ms padding ease, 100ms color ease-in, 150ms font-size ease-in;
	}

	.nav:hover {
		background: hsl(0, 0%, 90%);
		font-weight: 600;
		padding: 3px 0 3px 12.5px;
	}

	.nav.selected {
		color: rgb(15, 111, 255);
		background: rgba(206, 206, 206, 0.75);
		font-weight: 600;

		padding: 3px 0 3px 25px;
	}

	.nav--links > div {
		font-weight: 700;
		text-transform: uppercase;
		margin: 20px 0 5px 5px;
	}

	/* Category Links */
	.category__nav {
		display: flex;
		width: 100%;
	}

	.category__nav::before {
		content: '+ ';
		margin-right: 5px;
	}

	.selected.category__nav::before {
		content: '- ';
	}

	.category__title {
		margin: 0;
		padding: 0;

		flex: 1;
	}

	.category__color {
		border-radius: 0.25rem;
		width: 15px;
		margin: 5px 0;
	}

	/* Buttons */
	.control__btn {
		background: none;
		border: none;
		outline: none;
	}

	.control__btn.add--category {
		color: hsl(216, 100%, 50%);
		font-family: 'Nunito', sans-serif;
		font-weight: 600;
		font-size: 18px;

		display: flex;
		width: 100%;

		opacity: 0.7;
	}

	.control__btn.add--category:hover {
		background: none;
		opacity: 0.9;
	}

	.control__btn.delete--category {
		display: flex;
		align-items: center;
		justify-content: center;

		margin-right: 15px;

		opacity: 0;
		transform: scale(1.25);

		cursor: pointer;
	}
	.selected .control__btn.delete--category {
		margin-right: 25px;
	}

	.control__btn.delete--category:hover .bi {
		border-radius: 50%;
		background: hsla(0, 0%, 75%, 0.5);
	}
	.control__btn.delete--category .bi {
		fill: red;
	}

	.nav:hover .control__btn.delete--category {
		opacity: 1;
	}

	/* Category Form */
	.category__form .category__inputs {
		background: lightgray;

		padding: 5px;

		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 5px;

		position: relative;

		isolation: isolate;
	}

	.category__form input {
		border: none;
		background: none;
		outline: none;

		font-family: 'Poppins', Helvetica, sans-serif;

		width: 100%;
	}

	.category__form input[type='text'] {
		border: 1px solid grey;
		border-radius: 0.25rem;

		text-indent: 3px;
	}

	.category__form input[type='text']:focus {
		background: hsl(0, 0%, 90%);
		box-shadow: 0 0px 3px hsl(0, 0%, 50%);
	}

	.category__form input[type='color'] {
		width: 30px;

		cursor: pointer;
		appearance: none;
	}
	.category__form input[type='color']::-webkit-color-swatch-wrapper {
		padding: 2px 0;
	}
	.category__form input[type='color']::-webkit-color-swatch {
		border: 1px solid grey;
		border-radius: 0.25rem;
	}

	.category__form input[type='color']:focus-within::-webkit-color-swatch {
		box-shadow: 0 0px 3px hsl(0, 0%, 0%);
	}

	.category__form .category__buttons {
		background: lightgray;

		padding: 5px 0 10px;

		display: flex;
		justify-content: center;
		gap: 5px;
	}

	.category__buttons button {
		background: none;
		border: 1px solid grey;
		border-radius: 0.5rem;
		outline: none;

		font-family: 'Poppins', Helvetica, sans-serif;
		text-transform: uppercase;

		padding: 1px 6px;

		transition: all 0.4s ease;

		cursor: pointer;
	}

	.category__buttons button:hover {
		box-shadow: 0 0px 3px hsl(0, 0%, 50%);
		transform: translateY(-1px);
	}

	.category__buttons button[type='submit']:hover {
		background: hsl(120, 100%, 85%);
	}
	.category__buttons button[type='reset']:hover {
		background: hsl(0, 100%, 85%);
	}

	/* Settings */
	.control__btn.settings {
		font-family: 'Nunito', sans-serif;
		text-align: left;
		text-transform: uppercase;

		width: 100%;
		margin-bottom: 1rem;
		padding: 5px 10px;

		display: flex;
		align-items: center;
		gap: 5px;

		transition: all 0.4s ease;
	}
</style>
