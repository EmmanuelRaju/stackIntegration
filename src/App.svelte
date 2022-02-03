<script>
  import Confetti from "./Confetti.svelte";

  // import Calculator from "./Calculator.svelte";
  // let num;
  // let res;
  // $: view = num ? num : "enter numbers";

  // function handleSubmit() {
  //   num = num.split("'");
  //   switch (num[1]) {
  //     case "+":
  //       res = +num[0] + +num[2];
  //       break;
  //     case "-":
  //       res = +num[0] - +num[2];
  //       break;
  //     case "*":
  //       res = +num[0] * +num[2];
  //       break;
  //     case "/":
  //       res = +num[0] / +num[2];
  //       break;
  //   }
  //   console.log(res);
  //   num = res;
  // }
</script>

<h1>Hi from svelte</h1>
<h1>Hi from svelte</h1>

<!-- <h1 style="color: {num ? '#333' : '#ccc'}">{view}</h1>

<Calculator bind:value={num} on:submit={handleSubmit} /> -->

<Confetti />

<style>
  h1 {
    color: blue;
  }
</style>
