<template>
    <div class="index-c">
        <div>routers</div>
        <div v-for="item in routes">
            <a :href="'#' + item.path">{{ item.path }}</a>
        </div>
    </div>
</template>

<script>
  export default{
    data(){
      return{
        a: 'a',
        routes: []
      }
    },
    created(){
      this.routes = window.Gb.routes
    }

  }
</script>

<style lang="less">

</style>