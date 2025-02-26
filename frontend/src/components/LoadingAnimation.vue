<template>
  <div class="loader"></div>
</template>

<style>
  .loader {
    aspect-ratio: 1;
    border-radius: 50%;
    --loader-color: var(--color-cyan-500);
    background:
      radial-gradient(farthest-side, var(--loader-color) 94%, #0000) top/30% 30% no-repeat,
      conic-gradient(#0000 30%, var(--loader-color));
    mask: radial-gradient(farthest-side, #0000 calc(100% - 30%), #000 0);
    animation: l13 1s infinite linear;
  }

  @keyframes l13 {
    100% {
      transform: rotate(1turn);
    }
  }
</style>
