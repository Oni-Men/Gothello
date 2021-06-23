<script>
  export let onclick = null;
</script>

<div on:click={onclick ? onclick() : null} class:clickable={onclick}>
  <p><slot /></p>
  <p><slot name="sub" /></p>
</div>

<style>
  p {
    margin: 0.1em 0;
    font-size: 1.4em;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
  }
</style>
