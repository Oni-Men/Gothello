<svelte:options accessors={true} />

<script>
  import { onMount } from "svelte";
  import { SCENE_ENDING, SCENE_MATCHING, SCENE_MENU, SCENE_PLAYING } from "./define";
  import { startFindingOpponent, stopFindingOpponent } from "./netHandle";
  import { loadModels, init, renderGlobal } from "./render/render";

  export let game;
  export let scene;
  export let token;

  let progressText = "---";
  let loadingMessage = "";
  let errorMessage = "";

  let canvas, gl;

  const mouseEvents = [];
  const keyboardEvents = [];

  onMount(async () => {
    setInterval(() => {
      const arr = "---".split("");
      arr[parseInt((Date.now() / 500) % arr.length)] = "+";
      progressText = arr.join(" ");
    }, 500);

    gl = canvas.getContext("webgl");
    if (gl == null) {
      errorMessage = "WebGL is not supported on your browser.";
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
  <div class="box error no-select">
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
    {#if errorMessage}
      <p class="no-pointer-event error msg">{errorMessage}</p>
    {:else if loadingMessage}
      <p class="no-pointer-event load msg">{loadingMessage}</p>
    {/if}
    {#if scene != SCENE_PLAYING}
      <div class="bg box ui">
        {#if scene == SCENE_MENU}
          <p class="clickable" on:click={startFindingOpponent}>CLICK HERE TO START MATCHING</p>
        {:else if scene == SCENE_MATCHING}
          <div class="clickable" on:click={stopFindingOpponent}>
            <p>{progressText}</p>
            <span>Click here again. then back to menu</span>
          </div>
        {:else if scene == SCENE_ENDING}
          <!-- TODO  -->
          <p>YOU WIN!</p>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    text-align: center;
    margin: 0 auto;
  }

  .box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .view {
    width: 100%;
    height: 100%;
  }

  .error {
    color: darkred;
  }

  .load {
    color: black;
  }

  .bg {
    background: linear-gradient(#0779e466, #ffc47866);
    color: white;
  }

  .ui p {
    font-size: 2em;
    margin: 0;
  }
  .ui span {
    font-size: 1.4em;
  }
</style>
