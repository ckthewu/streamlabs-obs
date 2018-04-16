<template>
<div style="display: flex;flex-grow:1;">
  
<div
  class="studio-editor-display noselect"
  ref="display"
  @mousedown="handleMouseDown"
  @mouseup="handleMouseUp"
  @mousemove="handleMouseMove"
  @mouseenter="handleMouseEnter"
  @dblclick="handleMouseDblClick"/>
  
<div
  class="studio-editor-display2 noselect"
  ref="display2"
  @mousedown="handleMouseDown"
  @mouseup="handleMouseUp"
  @mousemove="handleMouseMove"
  @mouseenter="handleMouseEnter"
  @dblclick="handleMouseDblClick">
  <div class="scene-container" :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
    <div
      class="scene"
      v-for="(rect, index) in sceneItems.map(scene => scene.getRectangle())"
      :key="index"
      :style="{ 
        width: (rect.scaledWidth)/scale + 'px',
        height: (rect.scaledHeight)/scale + 'px',
        transform: `translate(${(rect.x)/scale}px, ${(rect.y)/scale}px)`
      }"
    />
  </div>
</div>
</div>
</template>

<script lang="ts" src="./StudioEditor.vue.ts"></script>

<style lang="less" scoped>
@import "../styles/index";

.studio-editor-display, .studio-editor-display2 {
  position: relative;
  flex-grow: 1;
  background-color: @navy-secondary;
}
.studio-editor-display2 {
  display: flex;
  align-items: center;
  justify-content: center;
}
.studio-editor-display2 * {
    pointer-events: none;
}
.studio-editor-display2 .scene-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
}
.studio-editor-display2 .scene {
  border: 1px solid red;
  background: transparent;
  position: absolute;
}
</style>
