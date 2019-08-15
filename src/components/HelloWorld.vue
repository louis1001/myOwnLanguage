<template>
  <div class="hello">
    <!-- <custom-console console-text="consoleOutput" /> -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {}
})
export default class HelloWorld extends Vue {
  @Prop() private msg!: string
  code: string = ''
  consoleOutput = ''
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
h3
  margin: 40px 0 0

ul
  list-style-type: none
  padding: 0

li
  display: inline-block
  margin: 0 10px

a
  color: #42b983

.code-input
  border: 1px solid gray
  min-height: 60px
  width: 80%
  white-space: pre

  &:focus
    border: 1px solid gray

</style>
