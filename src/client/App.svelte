<script>
  import { onMount } from "svelte";
  import { init, renderGlobal } from "./render/render";
  import { loadObj } from "./render/load";

  let loadingMessage = "";
  let errorMessage = "";

  let canvas, gl;
  let models = {
    disc: null,
  };
  let width = window.innerWidth;
  let height = window.innerHeight;

  let mouse = {
    x: 0,
    y: 0,
    button: [false, false, false, false, false],
    get primaryDown() {
      return !!button[0];
    },
    get secondaryDown() {
      return !!button[2];
    },
  };
  let keyboard = {};

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
  });

  //TODO objを解析して表示
  async function loadModels(gl) {
    loadingMessage = "Loading models...";
    for (const key of Object.keys(models)) {
      models[key] = await loadObj(gl, key);
    }
    loadingMessage = "";
  }

  onMount(async () => {
    gl = canvas.getContext("webgl");
    if (gl == null) {
      errorMessage = "WebGL is not supported on your browser.";
      return;
    }

    const loop = () => {
      renderGlobal(gl, models, mouse, keyboard);
      window.requestAnimationFrame(loop);
    };

    errorMessage = init(gl);
    if (errorMessage) {
      return;
    }

    await loadModels(gl);

    loop();
  });

  function handleMouseMove(e) {
    const r = e.target.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }

  function handleMouseDown(e) {
    mouse.button[e.button] = true;
  }

  function handleMouseUp(e) {
    mouse.button[e.button] = false;
  }

  function handleKeyDown(e) {
    keyboard[e.key] = true;
  }

  function handleKeyUp(e) {
    keyboard[e.key] = false;
  }
</script>

<main on:keypress={handleKeyDown} on:keyup={handleKeyUp}>
  <canvas
    bind:this={canvas}
    on:mousemove={handleMouseMove}
    on:mousedown={handleMouseDown}
    on:mouseup={handleMouseUp}
    {width}
    {height}
  />
  {#if errorMessage}
    <div class="box error">
      <p class="msg">{errorMessage}</p>
    </div>
  {:else if loadingMessage}
    <div class="box load">
      <p class="msg">{loadingMessage}</p>
    </div>
  {/if}
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
    justify-content: center;
    align-items: center;
  }

  .error {
    color: darkred;
  }

  .load {
    color: green;
  }
</style>
