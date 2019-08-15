<template>
  <div id="app">
    <code-editor v-on:running="execute"/>
    <pre id="code-result" v-text="consoleText"></pre>
    <div></div>
    <button id="clear-button" @click="clear">Clear</button>
    <!-- <custom-console custom-text="hello" v-on:running="sayHi" /> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
// @ts-ignore
import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import HelloWorld from './components/HelloWorld.vue'
import CodeEditor from './components/CodeEditor.vue'
import { evalCode, setupConsole } from '@/app/language/main'

Vue.use(VueCodemirror)

@Component({
  components: {
    HelloWorld,
    CodeEditor
  }
})

export default class App extends Vue {
  consoleText = 'console:\n'

  mounted () {
    setupConsole(this.print)
  }

  execute (param: string) {
    // const prevTime = performance.now()
    console.log('\n\n**************\n\n')
    const result = evalCode(param)

    // console.log('\nThe process took: ', performance.now() - prevTime, ' ms\n')
  }

  print (...values: any) {
    let val: string = ''
    for (let i = 0; i < values.length; i++) {
      val += values[i].toString()
    }

    this.$data.consoleText += val
  }

  clear () {
    this.consoleText = 'console:\n'
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: grid;
  padding: 0;
  grid-template-columns: 1fr 1fr;
  height: calc(100vh - 100px);
}

#code-result{
  text-align: left;
  border: 1px solid gray;
  border-radius: 5px;
  padding: 5px;
  overflow-y: scroll;
}

#clear-button{
  width: 50px;
  height: 20px;
  text-align: center;
  padding: 0;
}

</style>
