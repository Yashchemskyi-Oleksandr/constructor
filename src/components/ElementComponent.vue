<script setup lang="ts">
import { Element, Value } from "../schema";
import { reactive, ref, watch } from "vue";
import TextComponent from "./TextComponent.vue";
import EditorComponent from "./EditorComponent.vue";

function getCursorPosition(parent, node, offset, stat) {
  if (stat.done) return stat;

  let currentNode = null;
  if (parent.childNodes.length == 0) {
    stat.pos += parent.textContent.length;
  } else {
    for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
      currentNode = parent.childNodes[i];
      if (currentNode === node) {
        stat.pos += offset;
        stat.done = true;
        return stat;
      } else getCursorPosition(currentNode, node, offset, stat);
    }
  }
  return stat;
}

//find the child node and relative position and set it on range
function setCursorPosition(parent, range, stat) {
  if (stat.done) return range;

  if (parent.childNodes.length == 0) {
    if (parent.textContent.length >= stat.pos) {
      range.setStart(parent, stat.pos);
      stat.done = true;
    } else {
      stat.pos = stat.pos - parent.textContent.length;
    }
  } else {
    for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
      setCursorPosition(parent.childNodes[i], range, stat);
    }
  }
  return range;
}

const { element, inline = false, isAdmin } = defineProps({
  element: Element,
  inline: Boolean,
  isAdmin: Boolean
})

const rawValue = { value: element.value }
const value = reactive(rawValue)

watch(() => element.value, (v) => {
  value.value = v;
})

console.log(element.value);

function up(event) {
  if (event.target.innerHTML.includes('<')) {
    const sel = window.getSelection();
    const node = sel.focusNode;
    const offset = sel.focusOffset;
    const pos = getCursorPosition(event.target, node, offset, { pos: 0, done: false });
    if (offset === 0) pos.pos += 0.5;

    event.target.innerHTML = event.target.innerText;

    // restore the position
    sel.removeAllRanges();
    const range = setCursorPosition(event.target, document.createRange(), {
      pos: pos.pos,
      done: false,
    });
    range.collapse(true);
    sel.addRange(range);
  }
  element.value = event.target.innerText.replace(/\n$/, '');
  rawValue.value = element.value;
}

function changeCheckbox(index, event) {
  if (event.target.checked) {
    element.value.add(index);
  } else {
    element.value.delete(index);
  }
}

function addOption() {
  console.log('element.options', element.options);

  const value = new Value(element.schema);
  value.label = '';
  element.options.push(value);
}

function removeOption(index: number) {
  if (index < 0 || index >= element.options.length) return;
  for (let i = index; i < element.options.length - 1; i++) {
    element.options[i] = element.options[i + 1];
  }

  element.options.pop()
}

</script>

<template>
  <template v-if="inline">
    element?.references {{ element?.references }}
    <div v-if="element.type === 'text' && inline" class="inline-input" v-html="value.value"
      @keyup="up"
      contenteditable="true">
    </div>
  </template>
  <div v-else class="container-fluid">
    <div class="row align-items-start">
      <div class="col-4">
        <label class="form-label">{{ element.title }}</label>
        <div>
          <input class="form-control" v-if="element.type === 'text'" v-model="element.value">
          <select class="form-control" v-else-if="element.type === 'select' && !isAdmin" v-model="element.value"
            :style="{ outline: 'none', border: 'none', 'border-bottom': '1px solid black', padding: '0 5px' }">
            <option v-for="(option, index) in element.options" :value="index">{{ option.label }}</option>
          </select>
          <div v-else-if="element.type === 'checkbox' && !isAdmin" v-for="(option, index) in element.options">
            <input :checked="element.value.has(index)" type="checkbox" @change="changeCheckbox(index, $event)" />
            <label class="form-label">
              <TextComponent :schema="element.schema" :value="option.text" />
            </label>
          </div>
          <div v-else-if="element.type === 'radio' && !isAdmin" v-for="(option, index) in element.options" :key="index">
            <input :checked="element.value === index" :value="index" type="radio" @change="element.value = index" />
            <label class="form-label">
              <TextComponent :schema="element.schema" :value="option.text" />
            </label>

            <input type="text" v-model="option.label" placeholder="Варіант" />
            <button @click="removeOption(index)" v-if="element?.options.length > 1">Видалити</button>
          </div>
          <!-- IS ADMIN -->
          <div v-else-if="isAdmin" v-for="(option, index) in element.options" :key="index+1">
            <input type="text" v-model="option.label" placeholder="Варіант" />
            <button @click="removeOption(index)" v-if="element?.options.length > 1">Видалити</button>
          </div>
          <div v-if="isAdmin" ref="container">
            <div v-for="(option, index) in element.options" :key="index+1">
              <EditorComponent :textable="option" />
              <button @click="removeOption(index)" v-if="element?.options.length > 1">Видалити</button>
              <label class="form-label">
                <TextComponent :schema="element.schema" :value="option.label" />
              </label>
            </div>
          </div>
          <button type="button" @click="addOption">add option</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inline-input {
  min-width: 100px;
  display: inline;
  border-bottom: 1px solid black;
  padding: 0 5px;
}

.inline-input * {
  font: inherit !important;
  color: inherit !important;
  background: inherit !important;
}
</style>