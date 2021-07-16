<template>
	<transition name="menu">
		<nav class="navbar">
			<ul class="nav--links">
				<div>By Status</div>
				<li class="nav" :class="{ selected: link.selected }" v-for="(link, index) in navLinks" :key="index" @click="selectLink(index)">{{ link.title }}</li>

				<div>By Category</div>
				<li class="nav category__nav" :class="{ selected: link.selected }" v-for="(link, index) in navLinksByCategory" :key="index" @click="selectLinkByCat(index)">{{ link.title }}</li>
			</ul>
		</nav>
	</transition>
</template>

<script>
	export default {
		name: 'Navbar',

		data() {
			return {
				// Navbar variables
				navLinks: [
					{ title: '📄All', value: '', selected: true },
					{ title: '⌚Pending', value: 'pending', selected: false },
					{ title: '👍🏽Complete', value: 'complete', selected: false },
					{ title: '⭐Important', value: 'important', selected: false },
				],

				navLinksByCategory: [
					{ title: 'School', value: 'school', selected: false },
					{ title: 'Church', value: 'church', selected: false },
					{ title: 'Other', value: 'other', selected: false },
				],
			};
		},

		methods: {
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
				link.selected = !link.selected;

				this.$emit('sort', [this.navLinks, this.navLinksByCategory]);
			},
		},
	};
</script>

<style scoped>
	/* Navbar */
	.navbar {
		color: rgb(39, 39, 39);
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(3px);

		height: 100%;
		width: var(--nav-length);
		margin: 0;

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
		color: rgb(15, 111, 255);
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
	.category__nav::before {
		content: '+ ';
	}
	.selected.category__nav::before {
		content: '- ';
	}
</style>
