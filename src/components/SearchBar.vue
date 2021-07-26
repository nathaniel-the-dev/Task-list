<template>
	<span class="searchbox">
		<input class="search--input" type="search" placeholder="Search (by name or category)" maxlength="30" ref="searchInput" @keypress.enter="search" @input="getSearchQuery" @focus="searchFocused = true" @blur="searchFocused = false" />
		<button class="search--btn" @click="$refs.searchInput.focus()"><img src="../assets/icons/search.png" /></button>
	</span>
</template>

<script>
	export default {
		name: 'SearchBar',

		data() {
			return {
				searchQuery: '',
				searchFocused: false,
			};
		},

		methods: {
			getSearchQuery() {
				this.searchQuery = this.$refs.searchInput.value;
			},

			search() {
				this.getSearchQuery();
				this.$refs.searchInput.blur();
			},
		},

		watch: {
			searchQuery() {
				this.$emit('search', this.searchQuery.trim().toLowerCase(), this.searchFocused);
			},
		},
	};
</script>

<style>
	.searchbox {
		display: flex;
		align-items: center;

		position: absolute;
		right: 3.5rem;
	}

	.searchbox .search--input,
	.searchbox .search--btn {
		transition: 150ms background ease-in;
	}

	.searchbox .search--input {
		background: white;
		border: none;
		outline: none;
		border-top-left-radius: 5px;
		border-bottom-left-radius: 5px;

		font-family: 'Poppins', sans-serif;
		font-size: 1rem;
		font-weight: 400;

		height: 26px;
		width: 260px;
		padding: 0;
		padding-left: 3px;
	}

	.searchbox .search--input::-webkit-search-cancel-button {
		transform: translateY(-1px);
	}

	.searchbox .search--btn {
		background: white;
		border: none;
		outline: none;
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;

		height: 26px;
		width: 26px;
		padding: 3px;

		cursor: text;
	}

	.searchbox .search--btn img {
		height: 100%;
		width: 100%;
	}

	.searchbox .search--input:hover,
	.searchbox .search--input:hover + .search--btn {
		background: rgb(221, 221, 221);
	}

	.searchbox .search--input:focus,
	.searchbox .search--input:focus + .search--btn {
		background: rgb(211, 211, 211);
	}
</style>
