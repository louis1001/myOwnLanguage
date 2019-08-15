<template>
  <div>
    <section id="code-section">
    <!-- <textarea id="code-input" placeholder="a+b = c" v-model="code"></textarea> -->
    <codemirror id="code-input" v-model="code" :options="cmOptions" />

    <br>
    <button id="run-button" @click="runCode">Run</button>
  </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
// @ts-ignore
import { codemirror } from 'vue-codemirror'
// language js
import '../app/language/myLanguage.js'
// theme css
import 'codemirror/theme/cobalt.css'

@Component({
  components: {
    codemirror
  }
})
export default class CodeEditor extends Vue {
  data () {
    return {
      code: '',
      cmOptions: {
        // codemirror options
        tabSize: 4,
        mode: 'myLang',
        theme: 'cobalt',
        line: true,
        lineNumbers: true
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
  }

  runCode () {
    this.$emit('running', this.$data.code)
  }
}
</script>

<style>
.highlightText {
  background: yellow;
}

.input-div{
  height: 100px;
  border: 1px solid gray;
}

#code-input{
  font-family: 'Courier New', Courier, monospace;
  /* font-size: 0.5em; */
  width: 80%;
  min-height: 150px;
  max-height: 80vh;
  /* overflow-y: scroll; */
  border: 1px solid gray;
  border-radius: 10px;
  padding: 2px;
  cursor: text;
}
</style>
