<svelte:options accessors={true} />

<script>
  import { onMount } from "svelte";
  import { SCENE_ENDING, SCENE_MATCHING, SCENE_MENU, SCENE_PLAYING } from "./define";
  import { resetGameState } from "./main";
  import { startFindingOpponent, stopFindingOpponent } from "./netHandle";
  import { loadModels, init, renderGlobal } from "./render/render";

  export let turn;
  export let game;
  export let scene;
  export let token;
  export let result;

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
    <div class="no-pointer-event box flex-top">
      {#if scene == SCENE_PLAYING && turn}
        <p class="msg">Your turn</p>
      {/if}
      {#if errorMessage}
        <p class="no-pointer-event error msg">{errorMessage}</p>
      {:else if loadingMessage}
        <p class="no-pointer-event load msg">{loadingMessage}</p>
      {/if}
    </div>
    {#if scene != SCENE_PLAYING}
      <div class="bg box ui flex-center msg">
        {#if scene == SCENE_MENU}
          <p class="clickable" on:click={startFindingOpponent}>Click here to find opponent</p>
        {:else if scene == SCENE_MATCHING}
          <div class="clickable" on:click={stopFindingOpponent}>
            <p>{progressText}</p>
            <span>Click here again to back to menu</span>
          </div>
        {:else if scene == SCENE_ENDING && result != null}
          <div class="clickable" on:click={resetGameState}>
            <p>{result.winner} win!</p>
            <span>Black {result.black} - White {result.white}</span>
          </div>
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

  .msg {
    color: white;
    font-size: 1.4em;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
  }

  .box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .flex-top {
    justify-content: start;
    align-items: center;
  }

  .flex-center {
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
    font-size: 1.6em;
    margin: 0;
  }
  .ui span {
    font-size: 1.4em;
  }
</style>
