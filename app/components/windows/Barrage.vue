<template>
    <div class="barrage-container">
      <div class="barrage">test item</div>
      <div class="barrage">test item</div>
      <div class="barrage">test item</div>
      <div class="barrage">test item</div>
      <div class="barrage">test item</div>
    </div>
</template>

<script lang="ts" src="./Barrage.vue.ts"></script>

<style lang="less" scoped>
.barrage-container {
  background: #F00;
  display: flex;
  flex-direction: column;
  width: 100px;
  position: absolute;
  left: 0;
  top:0;
  animation: ani 5s infinite;
  -webkit-app-region: drag;
}

.barrage {
  font-size: 20px;
  color: #FFF;
}
@keyframes ani {
  0% {left: 0}
  50% {left: 800px}
  100% {left: 0}
}
</style>
