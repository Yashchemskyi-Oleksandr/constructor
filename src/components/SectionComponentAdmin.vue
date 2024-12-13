<script setup lang="ts">
import {computed, shallowReactive} from "vue";
import {Element, Schema, Section} from "../schema";
import EditorComponent from "./EditorComponent.vue";
import ElementComponent from "./ElementComponent.vue";
import TextComponent from "./TextComponent.vue";

const {section, schema, index} = defineProps({
  section: Section,
  schema: Schema,
  index: Number,
});

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

const MAX_HINT_LENGTH = 200;

function removeElement(id: string) {
  schema.elements.delete(id);
}

</script>

<template>
  <div :class="['card', {isRequired: section?.isRequired}]" style="border: 1px solid red; margin: 5px auto">
    <div class="card-header" style="background: lightgrey">
      <button>User</button>
      <button>Admin</button>
    </div>
    <button @click="schema?.removeSectionByIndex(index)">Remove section</button>
    <div>
      <input 
        class="form-check-input" 
        type="checkbox" 
        v-model="section.isRequired" 
      />
      <div>
        <input 
          class="form-check-input" 
          type="checkbox"
          v-model="section.withHint"
        />
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
    <div class="card-body">
      <h1>user</h1>
      <TextComponent :value="section.text" :schema="schema"/>
      <div v-for="element in externalElements" :key="element.id">
        <ElementComponent :element="element" :inline="false"/>
      </div>
    </div>
    <div style="margin-top: 50px;">
      <h1>admin</h1>
      <div class="card-footer" v-html="section.getText()"></div>
      <EditorComponent :textable="section" />
      <br />
      <div class="selector">
        <div class="radio-options" style="margin-top: 50px;">
          <h4>References list => {{ section.references }}</h4>
          <div v-for="(elementId, index) in section?.references" :key="index" style="margin-bottom: 10px;">
            <ElementComponent :element="section.schema.getElement(elementId)" :inline="false" isAdmin />
            <button type="button" @click="removeElement(elementId)">Видалити елемент</button>
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