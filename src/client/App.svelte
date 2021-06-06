<script>
	import Board from "./board.svelte";

	export let name;
	export let score;

	export let opponent;
</script>

<main>
	<p>{ name }</p>
	<p>{ score }</p>

	<p>{ opponent.name }</p>
	<p>{ opponent.score }</p>

	<Board />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
