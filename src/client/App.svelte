<script>
	import Board from "./board.svelte";
	let canvas;
	let width = window.innerWidth;
	let height = window.innerHeight;

	window.addEventListener("resize", () => {
		width = window.innerWidth;
		height = window.innerHeight;
	});
</script>

<main>
	<canvas bind:this={canvas} {width} {height} />
</main>

<style>
	main {
		text-align: center;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
