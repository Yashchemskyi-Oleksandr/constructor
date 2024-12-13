<script setup lang="ts">
import {computed, ref} from "vue";
import {Element, Schema, Section} from "../schema";
import EditorComponent from "./EditorComponent.vue";
import ElementComponent from "./ElementComponent.vue";
import TextComponent from "./TextComponent.vue";

const {section, schema, index} = defineProps({
  section: Section,
  schema: Schema,
  index: Number,
});

const MAX_HINT_LENGTH = 200;
const tabs = ['User', 'Admin', 'Preview'];
const currentTab = ref('Admin');

function getExternalElements(text: string, elements: Element[] = []): Element[] {
  console.log('ASAAAAAAA');
  
  Array.from(text.matchAll(/<el id="(\d+)"><\/el>/g)).forEach(({"1":id})=>{
    const element = schema.getElement(id);
    if (!element.isInline) {
      elements.push(element);
      getExternalElements(element.text, elements);
    }
  });

  return elements;
}

const externalElements = computed(()=>{
  return getExternalElements(section.text, [])
})

</script>

<template>
  <div :class="['card', {isRequired: section?.isRequired}]" style="border: 1px solid red; margin: 5px auto">
    <button @click="schema?.copySection(index)">Copy section</button>
    <button @click="schema?.removeSectionByIndex(index)">Remove section</button>
    <div class="card-header" style="background: lightgrey">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: currentTab === tab }"
        @click="currentTab = tab"
      >
        {{ tab }}
      </button>
    </div>
    <div class="d-inline-flex gap-3">
      <label>
        isRequired
        <input 
          class="form-check-input" 
          type="checkbox" 
          v-model="section.isRequired" 
        />
      </label>
      <div>
        <label>
          Додати підказку
          <input 
            class="form-check-input" 
            type="checkbox"
            v-model="section.withHint"
          />
        </label>
        <div v-if="section.withHint" class="hint-section mt-3">
          <label for="hintTextarea">Підказка:</label>
          <textarea 
            id="hintTextarea"
            v-model="section.hint" 
            placeholder="Введіть підказку тут..." 
            :maxlength="MAX_HINT_LENGTH"
            class="form-control"
          ></textarea>
          <div class="char-counter">
            {{ section.hint.length }}/{{ MAX_HINT_LENGTH }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentTab === 'User'" class="card-body">
      <h1>user</h1>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; border-right: 1px solid;">
        <div>
          <h1>TextComponent</h1>
          <TextComponent :value="section.text" :schema="schema"/>
        </div>
        <div>
          <h1>ElementComponent</h1>
          <div v-for="element in externalElements" :key="element.id">
            <ElementComponent :element="element" />
            <hr>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentTab === 'Admin'">
      <h1>admin</h1>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <EditorComponent :textable="section" />
        <div class="card-footer" v-html="section.getText()"></div>
      </div>
      <br />
      <div class="selector">
        <div class="radio-options" style="margin-top: 50px;">
          <h4>References list => {{ section.references }}</h4>
          <div v-for="(elementId, index) in section?.references" :key="index" style="margin-bottom: 10px;">
            <ElementComponent :element="section.schema.getElement(elementId)" :inline="false" isAdmin />
          </div>
        </div>
      </div>
    </div>
    <footer>

    </footer>
  </div>
</template>


<style lang="scss">
.isRequired {
  border: 1px solid;
  background: red;
}
.char-counter {
  text-align: right;
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
}

.text-danger {
  color: red;
}
</style>