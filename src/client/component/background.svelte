<script>
  /**
    startColor: グラデーションの開始色
    endColor: グラデーションの終了色
    no_pointer: ポインターイベントの有効/無効
    justify: 子要素の配置（フレックスレイアウト）
   */

  export let startColor = "transparent";
  export let endColor = "transparent";
  export let no_pointer = false;
  export let justify = "center";

  let box;

  $: if (box) {
    box.style["background"] = `linear-gradient(${startColor}, ${endColor})`;
    box.style["justify-content"] = justify;
  }
</script>

<div bind:this={box} class="box msg" class:no_pointer>
  <slot />
</div>

<style>
  .msg {
    color: white;
    font-size: 1.4em;
    text-shadow: 0 2px 2px rgba(0, 0, 0, 0.5);
  }
</style>
