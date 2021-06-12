<script>
  import { onMount } from "svelte";
  import { loadModels, init, renderGlobal } from "./render/render";

  let loadingMessage = "";
  let errorMessage = "";

  let canvas, gl;
  let width = window.innerWidth;
  let height = window.innerHeight;

  let mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    wheelX: 0,
    wheelY: 0,
    button: [false, false, false, false, false],
    get primaryDown() {
      return !!this.button[0];
    },
    get secondaryDown() {
      return !!this.button[2];
    },
    refresh() {
      this.dx = 0;
      this.dy = 0;
      this.wheelX = 0;
      this.wheelY = 0;
      for (const i in this.button) {
        this.button[i] = false;
      }
    },
  };
  let keyboard = {};

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
  });

  onMount(async () => {
    gl = canvas.getContext("webgl");
    if (gl == null) {
      errorMessage = "WebGL is not supported on your browser.";
      return;
    }

    const loop = () => {
      renderGlobal(gl, mouse, keyboard);
      window.requestAnimationFrame(loop);
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

  function handleMouseMove(e) {
    const r = e.target.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.dx = e.movementX;
    mouse.dy = e.movementY;
  }

  function handleMouseDown(e) {
    mouse.button[e.button] = true;
  }

  function handleMouseUp(e) {
    mouse.button[e.button] = false;
  }

  function handleMouseLeave(e) {
    mouse.refresh();
  }

  function handleMouseWheel(e) {
    mouse.wheelX = e.deltaX;
    mouse.wheelY = e.deltaY;
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
    on:mouseleave={handleMouseLeave}
    on:mousewheel={handleMouseWheel}
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
    color: black;
  }
</style>
