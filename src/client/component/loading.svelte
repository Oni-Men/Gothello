<script>
</script>

<span class="circle a" />
<span class="circle b" />
<span class="circle c" />

<style>
  .circle {
    display: inline-block;
    content: "";
    width: 0.5em;
    height: 0.5em;
    background-color: white;
    border-radius: 50%;
    transform: scale(0);
    animation: scale-up-down 3s infinite, ease;
  }

  .a {
    animation-delay: 0s;
  }

  .b {
    animation-delay: 0.5s;
  }

  .c {
    animation-delay: 1s;
  }

  @keyframes scale-up-down {
    0% {
      transform: scale(0);
    }

    25% {
      transform: scale(1);
    }

    50% {
      transform: scale(0);
    }

    100% {
      transform: scale(0);
    }
  }
</style>
