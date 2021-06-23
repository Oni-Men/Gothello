<svelte:options accessors={true} />

<script>
  import { onMount } from "svelte";
  import Background from "./component/background.svelte";
  import Loading from "./component/loading.svelte";
  import Message from "./component/message.svelte";
  import { SCENE_ENDING, SCENE_MATCHING, SCENE_MENU, SCENE_PLAYING } from "./define";
  import { resetGameState } from "./main";
  import { startFindingOpponent, stopFindingOpponent } from "./netHandle";
  import { loadModels, init, renderGlobal } from "./render/render";

  export let turn;
  export let game;
  export let scene;
  export let token;
  export let result;

  let loadingMessage = "";
  let errorMessage = "";

  let canvas, gl;

  const mouseEvents = [];
  const keyboardEvents = [];

  onMount(async () => {
    gl = canvas.getContext("webgl");
    if (gl == null) {
      errorMessage = "Your browser doesn't support WebGL";
      return;
    }

    const loop = () => {
      window.requestAnimationFrame(loop);
      renderGlobal(gl, mouseEvents, keyboardEvents, { game, scene, token });
    };

    errorMessage = init(gl);
    if (errorMessage) {
      return;
    }

    loadingMessage = "Loading models...";
    await loadModels(gl);
    loadingMessage = "";

    loop();
  });

  function handleMouseEvent(e) {
    mouseEvents.push(e);
  }

  function handleKeyboard(e) {
    keyboardEvents.push(e);
  }
</script>

<svelte:window on:keydown={handleKeyboard} />

<main>
  <Background>
    <canvas
      class="view"
      bind:this={canvas}
      on:mousemove={handleMouseEvent}
      on:mousedown={handleMouseEvent}
      on:mouseup={handleMouseEvent}
      on:mouseleave={handleMouseEvent}
      on:wheel={handleMouseEvent}
      on:keydown={handleKeyboard}
      on:keyup={handleKeyboard}
    />
  </Background>
  <Background no_pointer="true" justify="flex-end">
    {#if scene == SCENE_PLAYING && turn}
      <Message>Your turn</Message>
    {/if}
  </Background>
  {#if scene != SCENE_PLAYING}
    <Background startColor="#0779e466" endColor="#ffc47866">
      {#if scene == SCENE_MENU}
        <Message onclick={startFindingOpponent}>Click here to find opponent</Message>
      {:else if scene == SCENE_MATCHING}
        <Message onclick={stopFindingOpponent}>
          <Loading />
          <span slot="sub">Click here again to back to menu</span>
        </Message>
      {:else if scene == SCENE_ENDING && result != null}
        <Message onclick={resetGameState}>
          {result.winner} win!
          <span slot="sub">Black {result.black} - White {result.white}</span>
        </Message>
      {/if}
    </Background>
  {/if}
  {#if errorMessage}
    <Background startColor="#CE1212cc" endColor="#1B1717cc">
      <Message>{errorMessage}</Message>
    </Background>
  {/if}
  {#if loadingMessage}
    <Background startColor="#72147Ecc" endColor="#FF449Fcc">
      <Message>{loadingMessage}</Message>
    </Background>
  {/if}
</main>

<style>
  main {
    text-align: center;
    margin: 0 auto;
  }

  .view {
    width: 100%;
    height: 100%;
  }
</style>
