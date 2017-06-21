<template>
    <div class="switch-c">
        <mt-switch v-model="value" @change="change"></mt-switch>
    </div>
</template>

<script>
  import Vue from 'vue'
  import { Switch } from 'mint-ui'

  Vue.component(Switch.name, Switch)

  export default{
    data(){
      return {
        value: true,

      }
    },
    methods: {
      change(val){
        console.log(val)
      },
//      loadMore() {
//        this.loading = true
//        this.isHide = false
//        setTimeout(() => {
//          let last = this.list[this.list.length - 1]
//          for (let i = 1; i <= 10; i++) {
//            this.list.push(last + i)
//          }
//          this.loading = false
//          setTimeout(() => {
//            this.isHide = true
//          }, 0)
//        }, 2500)
//      },
//      listen(){
//        console.log('listen')
//      }
    }
  }
</script>

<style lang="less">

</style>