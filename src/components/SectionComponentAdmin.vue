<script setup lang="ts">
import {computed, reactive, ref, shallowReactive, watch} from "vue";
import {Element, Schema, Section, Value} from "../schema";
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

const showEditor = ref(false);
const lastElementId = ref<string>('');
const elementTypes = ["null", "radio", "select", 'checkbox'] as const;
type ElementType = typeof elementTypes[number];

const selectedType = ref<ElementType>("null");
const currentElement = shallowReactive<any>([]);
const MAX_HINT_LENGTH = 200;

const addSectionElement = () => {
  if(selectedType.value) {
    const element = new Element(schema);
    element.id = schema.getNewId();
    element.type = selectedType.value;
    element.title = 'poool';
    element.value = [];

    lastElementId.value = element.id;
    // currentElement.push(element);
    currentElement.splice(0, 1, element);
    schema?.addElement(element);
  } else {
    currentElement.splice(0)
    lastElementId.value = '';
  }
}

</script>

<template>
  <div :class="['card', {isRequired: section?.isRequired}]" style="border: 1px solid red; margin: 5px auto">
    <div class="card-header" style="background: lightgrey">Text
      <button @click="showEditor=true">Edit</button>
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
    <div>
      <h1>admin</h1>
      <div class="card-footer" v-html="section.getText()"></div>
      <EditorComponent :textable="section"/>
      <br />
    <div>
        <h4>Опції (синхронізовані):</h4>
        currentElement?.options {{ currentElement?.options }}
      </div>
      <div class="selector">
        <h3>Вибір Типу Елемента</h3>
        <div>
          <label for="element-type">Тип Елемента:</label>
          <select id="element-type" v-model="selectedType" @change="addSectionElement">
            <option v-for="type in elementTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        currentElement {{currentElement}}
        <div class="radio-options" style="margin-top: 20px;">
          <h4>Опції для Radio</h4>
          <div v-for="(element, index) in currentElement" :key="index" style="margin-bottom: 10px;">
            <ElementComponent :element="element" :inline="false" isAdmin/>
          </div>
        </div>
      </div>
    </div>
    <footer>

    </footer>
  </div>
  <!-- <ModalComponent v-if="showEditor" @hide="showEditor = false">
    <template #title>Text</template>
    <EditorComponent :textable="section"/>
  </ModalComponent> -->
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