<template>
    <div class="infintescroll-c">
        <ul class="scroll-c"
            infinite-scroll-immediate-check="isCheck"
            infinite-scroll-listen-for-event="listen"
            v-infinite-scroll="loadMore"
            infinite-scroll-disabled="loading"
            infinite-scroll-distance="10">
            <li v-for="item in list">{{ item }}</li>
        </ul>
        <div :class="{ hide: isHide }">加载中...</div>
    </div>
</template>

<script>
  import Vue from 'vue'
  import { InfiniteScroll } from 'mint-ui'

  Vue.use(InfiniteScroll)

  export default{
    data(){
      return {
        list: [1, 2, 3, 4, 5,6,7,8,9],
        loading: false,
        isHide: true,
        isCheck: false,

      }
    },
    methods: {
      loadMore() {
        this.loading = true
        this.isHide = false
        setTimeout(() => {
          let last = this.list[this.list.length - 1]
          for (let i = 1; i <= 10; i++) {
            this.list.push(last + i)
          }
          this.loading = false
          setTimeout(() => {
            this.isHide = true
          }, 0)
        }, 2500)
      },
      listen(){
        console.log('listen')
      }
    }
  }
</script>

<style lang="less">
    @import "index.less";
</style>