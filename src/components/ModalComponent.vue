<script setup lang="ts">
import {nextTick, ref} from "vue";

const emit = defineEmits(['hide'])

const show = ref(false)
nextTick(() => {
  show.value = true
})

function hide() {
  show.value = false
  setTimeout(() => emit('hide'), 500)
}
</script>

<template>
  <div :class="{show}" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <slot name="title">Title</slot>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  display: block;
  background: rgba(0, 0, 0, 0.3);
}
</style>