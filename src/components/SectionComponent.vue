<script setup lang="ts">
import {computed, ref} from "vue";
import {Element, Schema, Section} from "../schema";
import EditorComponent from "./EditorComponent.vue";
import ElementComponent from "./ElementComponent.vue";
import ModalComponent from "./ModalComponent.vue";
import TextComponent from "./TextComponent.vue";

const {section, schema} = defineProps({
  section: Section,
  schema: Schema
});

function getExternalElements(text: string, elements: Element[] = []): Element[] {
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

const showEditor = ref(false);

</script>

<template>
  <div class="card" style="border: 1px solid red; margin: 5px auto">
    <div class="card-header" style="background: lightgrey">Text
      <button @click="showEditor=true">Edit</button>
    </div>
    <div class="card-body">
      <h1>user</h1>
      <TextComponent :value="section.text" :schema="schema"/>
      <div v-for="element in externalElements" :key="element.id">
        <ElementComponent :element="element" :inline="false"/>
      </div>
    </div>
    <div>
      <h1>admin</h1>
      <div class="card-footer" v-html="section.getText()"></div>
      <EditorComponent :textable="section"/>
    </div>
  </div>
  <!-- <ModalComponent v-if="showEditor" @hide="showEditor = false">
    <template #title>Text</template>
    <EditorComponent :textable="section"/>
  </ModalComponent> -->
</template>
