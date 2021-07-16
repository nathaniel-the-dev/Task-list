<template>
	<div @click="searchFocused = false">
		<header>
			<div class="icon--wrapper" :title="`${showMenu ? 'Hide' : 'Show'} menu`" @click="showMenu = !showMenu">
				<img draggable="false" class="menu--icon" src="./assets/icons/menu.png" />
			</div>

			<h2 class="app--title">Task List</h2>

			<SearchBar @search="search" />
		</header>

		<main class="main__container">
			<transition-group name="menu">
				<Navbar v-if="showMenu" @sort="sortTasks" key="menu" />

				<section class="main--content" key="content">
					<section class="task__view">
						<h1 class="task__view--title">{{ formattTitle }} Tasks</h1>
						<h2 class="task__view--date">
							{{ formattDate() }} <span v-if="tasksByDate.length" style="font-weight:600;"> - {{ tasksByDate[0].points.current }}/{{ tasksByDate[0].points.total }} pts</span>
						</h2>
					</section>

					<div class="task--list--background">
						<TaskInput @addTask="addTask" class="task__input--form" />

						<transition name="fade" mode="out-in" appear>
							<h3 class="task--list--error" v-if="!tasksByDate.length">No tasks found.</h3>

							<div v-else class="task--lists--container">
								<ul class="task--list" v-for="(taskList, index) in searchFocused ? searchResults : tasksByDate" :key="index">
									<h3 class="task--list--date" v-if="taskList.tasks.length">
										{{ formattDate(new Date(taskList.date)) }}<span style="font-weight:600;"> - {{ taskList.points.current }}/{{ taskList.points.total }} pts</span>
									</h3>

									<transition-group name="tasks" appear>
										<li class="task" :class="{ complete: task.isComplete }" v-for="(task, index) in taskList.tasks" :key="task.id" :data-id="task.id">
											<div class="task__intro--container">
												<transition name="switch" mode="out-in">
													<svg @click="markAsComplete(task, index)" v-if="!task.isComplete" class="select__icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
														<use href="./assets/icons/unselect.svg#icon"></use>
													</svg>

													<svg @click="task.isComplete = false" v-else class="select__icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
														<use href="./assets/icons/select.svg#icon"></use>
													</svg>
												</transition>

												<h3 class="task__name" :title="task.name">{{ task.name }}</h3>
											</div>

											<div class="task__dueDate">{{ formattDueDate(task.dueDate) }}</div>

											<div class="task__points">{{ task.points }} {{ task.points === 1 ? 'pt.' : 'pts.' }}</div>

											<div class="task__category" :class="task.category">{{ formattCategory(task.category) }}</div>

											<div class="task__control--buttons">
												<div class="isFavourite__btn__container" @click="task.isFavourite = !task.isFavourite">
													<svg class="fav__icon" height="20" width="20" viewBox="0 -10 512 512">
														<use href="./assets/icons/unfavourite.svg#icon"></use>
													</svg>

													<transition name="switch">
														<svg class="fav__icon favourited" v-if="task.isFavourite" height="20" width="20" viewBox="0 0 24 24">
															<use href="./assets/icons/favourite.svg#icon"></use>
														</svg>
													</transition>
												</div>

												<div class="delete__btn__container">
													<svg class="delete__icon" @click="deleteTask(task.id)" width="20" height="20" viewBox="0 0 512 512"><use href="./assets/icons/delete.svg#icon"></use></svg>
												</div>
											</div>

											<audio preload="auto" :ref="`ding${index}`">
												<source src="./assets/audio/ding.mp3" type="audio/mpeg" />
											</audio>
										</li>
									</transition-group>
								</ul>
							</div>
						</transition>
					</div>
				</section>
			</transition-group>
		</main>
	</div>
</template>

<script>
	import TaskInput from '@/components/TaskInput.vue';
	import Navbar from '@/components/Navbar.vue';
	import SearchBar from '@/components/SearchBar.vue';

	import { ref, computed } from 'vue';

	export default {
		name: 'App',
		components: { TaskInput, Navbar, SearchBar },

		setup() {
			// Methods
			function addTask(taskObj) {
				// Add task to array
				allTasks.value.unshift(taskObj);

				// Update storage
				updateStorage();
			}

			function deleteTask(id) {
				// Remove task from array
				const index = allTasks.value.findIndex((task) => task.id === id);
				allTasks.value.splice(index, 1);

				// Update storage
				updateStorage();
			}

			function getStorageData() {
				if (!localStorage.getItem('tasks')) updateStorage();

				allTasks.value = JSON.parse(localStorage.getItem('tasks'));
				allTasks.value.forEach((task) => {
					task.dateCreated = new Date(task.dateCreated);
					task.dueDate = task.dueDate ? new Date(task.dueDate) : '';
				});
			}
			function updateStorage() {
				localStorage.setItem('tasks', JSON.stringify(allTasks.value));
			}

			function sortTasks(queries) {
				const [status, categories] = queries;
				filters.value.status = status.find((s) => s.selected).value;
				filters.value.categories = [...categories.filter((c) => c.selected)].map((cat) => cat.value);
			}

			function search(query, focus = false) {
				if (!query) return;

				const dates = new Set(allTasks.value.map((task) => task.dateCreated.toDateString()));

				searchResults.value = [...dates].map((date) => {
					return {
						date,
						tasks: allTasks.value.filter((task) => task.name.includes(query) || task.category.startsWith(query)),
						points: {
							total: allTasks.value.reduce((acc, cur) => acc + cur.points, 0),
							current: allTasks.value.reduce((acc, cur) => (cur.isComplete ? acc + cur.points : acc + 0), 0),
						},
					};
				});
				searchFocused.value = focus;
			}

			// Variables
			let now = ref(new Date());
			let showMenu = ref(true);

			const allTasks = ref([]);

			const filters = ref({ status: '', categories: [] });
			const filteredTasks = computed(() => {
				let finalArray = [];

				// Filters by status or tag
				switch (filters.value.status) {
					case '':
						finalArray = allTasks.value;
						break;
					case 'pending':
						finalArray = allTasks.value.filter((task) => !task.isComplete);
						break;
					case 'complete':
						finalArray = allTasks.value.filter((task) => task.isComplete);
						break;
					case 'important':
						finalArray = allTasks.value.filter((task) => task.isFavourite);
						break;
					default:
						break;
				}

				// Filters for category
				if (filters.value.categories.length) {
					finalArray = finalArray.filter((task) => filters.value.categories.includes(task.category));
				}

				return finalArray;
			});

			const searchResults = ref([]);
			const searchFocused = ref(false);

			const dates = computed(() => {
				return new Set(filteredTasks.value.map((task) => task.dateCreated.toDateString()));
			});
			const tasksByDate = computed(() => {
				return [...dates.value].map((date) => {
					return {
						date,
						tasks: filteredTasks.value.filter((task) => task.dateCreated.toDateString() === date),
						points: { total: filteredTasks.value.reduce((acc, cur) => acc + cur.points, 0), current: filteredTasks.value.reduce((acc, cur) => (cur.isComplete ? acc + cur.points : acc + 0), 0) },
					};
				});
			});
			const formattTitle = computed(() => {
				switch (filters.value.status) {
					case '':
						return 'All';
					case 'pending':
						return 'Pending';
					case 'complete':
						return 'Completed';
					case 'important':
						return 'Important';
					default:
						return;
				}
			});

			return { allTasks, tasksByDate, searchResults, searchFocused, now, showMenu, formattTitle, addTask, deleteTask, sortTasks, search, getStorageData, updateStorage };
		},

		mounted() {
			// Set time
			setInterval(() => (this.now = new Date()), 60000);

			// Get storage data
			this.getStorageData();

			// Send notifications
			this.sendNotif();
			setInterval(this.sendNotif, 60000);

			// Move task to new date
			this.allTasks.forEach((task) => {
				if (!task.isComplete) {
					// Set new date
					task.dateCreated = this.now;

					// Update storage
					this.updateStorage();
				}
			});
		},

		methods: {
			// Notification Methods
			sendNotif() {
				// Check if tasks are due
				const numOfDueTasks = this.allTasks.reduce((acc, cur) => {
					if (!cur.dueDate) return (acc += 0);
					if (cur.dueDate.getTime() > this.now.getTime()) return (acc += 1);
				}, 0);

				// Return if not
				if (!numOfDueTasks) return;

				// Send notification
				new Notification('Reminder', { body: `${numOfDueTasks} task${numOfDueTasks > 1 ? 's' : ''} due` });
			},

			// UI Methods
			formattCategory(category) {
				switch (category) {
					case 'school':
						return 'School🏫';
					case 'church':
						return 'Church⛪';
					case 'other':
						return 'Other';
					default:
						break;
				}
			},

			formattDate(date) {
				return new Intl.DateTimeFormat(navigator.language, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(date || this.now);
			},

			formattDueDate(dueDate) {
				if (!dueDate) return '';

				const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));

				if (daysUntil === 0) return 'Due today';
				if (daysUntil === 1) return 'Due tomorrow';
				if (daysUntil >= 2 && daysUntil < 7) return `Due in ${daysUntil} days`;
				if (daysUntil >= 7) return `Due on ${new Intl.DateTimeFormat(navigator.language, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(dueDate)}`;
			},

			markAsComplete(task, index) {
				// Mark task as complete
				task.isComplete = true;

				// Update storage
				this.updateStorage();

				// Play audio
				this.$refs[`ding${index}`].play();
			},
		},
	};
</script>

<style>
	/* Root */
	:root {
		--nav-length: 175px;
		--task-border-color: rgb(175, 175, 175);
		--task-background: rgb(210, 210, 210);
		--task-background-focused: rgb(190, 190, 190);
		--task-background-hover: rgb(205, 205, 205);
	}

	body {
		margin: 0;
		padding: 0;
		box-sizing: border-box;

		background: url('./assets/images/background.jpg') no-repeat fixed;
		background-size: cover;

		overflow: hidden;

		color: #00000017;
	}

	/* Header */
	header {
		color: white;
		background: rgba(15, 39, 255, 0.75);

		height: 50px;
		width: 100%;

		display: flex;
		align-items: center;

		position: relative;

		user-select: none;
	}

	.icon--wrapper {
		width: 30px;
		height: 30px;
		margin: 0 5px;

		display: flex;
		align-items: center;
		justify-content: center;

		cursor: pointer;
	}

	.icon--wrapper:hover {
		transform: scale(1.1);
	}

	.icon--wrapper .menu--icon {
		width: 60%;
		height: 60%;
	}

	.app--title {
		font-family: 'Nunito', sans-serif;
		font-weight: 600;

		margin: 0;
	}

	/* Main */
	.main__container {
		background: white;

		height: 100vh;
		width: 100vw;

		display: flex;

		position: relative;

		overflow-y: hidden;
	}

	.main--content {
		border-left: 1px solid rgb(190, 190, 190);

		height: 100%;
		width: 100%;
		padding: 15px 20px;
	}

	.task__view {
		font-family: 'Nunito', sans-serif;
	}

	.task__view--title {
		color: rgb(31, 31, 31);
		font-size: 26px;
		font-weight: 700;
		text-decoration: underline double;

		margin: 0;

		user-select: none;
	}

	.task__view--date {
		color: rgb(65, 65, 65);
		font-size: 20px;
		font-weight: 500;
		text-align: center;
		text-decoration: underline;
		margin: 25px 0 15px 0;
		display: inline-block;

		user-select: none;
	}

	/* Tasks */
	.task--list--background {
		border-radius: 5px;
		border: 1px solid rgb(150, 150, 150);
		box-shadow: 0px 1px 3px 2px rgba(150, 150, 150, 0.75);

		text-align: center;

		width: 100%;
		height: 70vh;

		position: relative;

		overflow: hidden;
	}

	.task--list--error {
		color: black;
		font-family: 'Poppins', sans-serif;
		font-size: 2rem;

		user-select: none;
	}

	.task--lists--container {
		overflow-x: hidden;
		overflow-y: auto;
	}

	.task--list {
		color: black;
		background: rgba(210, 210, 210, 0.8);

		height: 100%;
		width: 100%;
		margin: 0;
		padding: 0;

		list-style: none;

		overflow: hidden;
	}

	.task--list--date {
		color: black;
		background: rgb(155, 155, 155);
		border-top: 2px solid rgb(100, 100, 100);

		font-family: 'Nunito', sans-serif;
		font-size: 16px;
		font-weight: 600;
		line-height: 200%;

		height: 30px;
		margin: 0;
		padding: 0;
		padding-left: 4px;
	}

	.task {
		font-family: 'Poppins', sans-serif;
		background: var(--task-background);
		border-bottom: 2px solid var(--task-border-color);

		text-align: left;

		height: 50px;

		display: grid;
		grid-template-columns: 45% 20% 15% 15% 5%;
		align-content: center;
		justify-items: stretch;

		position: relative;

		transition: 200ms background ease-in;

		overflow: hidden;
	}

	.task:hover {
		background: var(--task-background-hover);
	}

	.task.complete {
		background: var(--task-background-focused);
	}

	.task.complete {
		color: rgb(100, 100, 100);
	}

	.task::before {
		content: '';
		background: rgb(100, 100, 100);

		width: 0;
		height: 2px;

		position: absolute;
		left: 35px;
		top: calc(50% - 1px);
		z-index: 0;

		transition: all 0.33s ease;
	}
	.task.complete::before {
		width: 90%;
	}

	.task__intro--container {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.task .select__icon {
		margin-left: 10px;
		cursor: pointer;
	}

	.task .task__name {
		font-family: 'Nunito', sans-serif;
		font-size: 20px;
		font-weight: 600;
		text-transform: capitalize;

		margin: 0;
		padding: 0;

		overflow: hidden;
		text-overflow: ellipsis;
	}

	.task .task__dueDate,
	.task .task__category,
	.task .task__points {
		font-weight: 400;
		text-indent: 5px;
	}

	.task .task__control--buttons {
		padding: 0 5px;

		display: flex;
		justify-content: center;
		gap: 10px;
	}

	.task__control--buttons div {
		display: flex;
		place-items: center;
	}

	.task .isFavourite__btn__container {
		position: relative;
	}

	.fav__icon.favourited {
		position: absolute;
		top: 50%;
		left: 0;
		z-index: 0;
		transform: translateY(-50%);
	}

	.fav__icon,
	.delete__icon {
		cursor: pointer;
		z-index: 1;
	}
</style>

<style scoped>
	/* Transitions */
	.switch-enter-from,
	.switch-leave-to {
		opacity: 0;
	}
	.switch-enter-active,
	.switch-leave-active {
		transition: opacity 0.33s ease;
	}

	.menu-enter-from,
	.menu-leave-to {
		transform: translateX(-100%);
	}
	.menu-enter-active {
		transition: all 0.33s ease;
	}
	.menu-leave-active {
		position: absolute;
		transition: all 0.33s ease;
	}
	.menu-move {
		transition: all 0.33s ease;
	}

	.fade-enter-from,
	.fade-leave-to {
		opacity: 0;
		transform: translateY(10px);
	}

	.fade-enter-active,
	.fade-leave-active {
		transition: all 0.5s ease;
	}

	.tasks-enter-from,
	.tasks-leave-to {
		opacity: 0;
		transform: scale(0.75);
	}
	.tasks-enter-active,
	.tasks-leave-active {
		transition: all 0.3s ease;
	}
</style>
