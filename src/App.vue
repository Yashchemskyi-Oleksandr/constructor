<script setup lang="ts">
import {computed, ref, shallowRef, watch} from 'vue'
import SectionComponent from "./components/SectionComponent.vue";
import {Schema, Section} from "./schema";
import SectionComponentAdmin from './components/SectionComponentAdmin.vue';

const schema = shallowRef(Schema.fromJSON({
  latestElementId: 5,
  sections: [
    {
      isRequired: false,
      withHint: false,
      text: '<p>Hello <el id="1"></el> world <el id="2"></el> radioVal: <el id="4"></el></p>',
      elements: []
    },
    {
      isRequired: false,
      withHint: false,
      text: '<p>One element <el id="5"></el> => end => <el id="4"></el></p>',
      elements: []
    }
  ],
  elements: [{
    id: '1',
    title: 'qwerty',
    type: 'text',
    value: 'world'
  }, {
    id: '2',
    title: "external select",
    type: 'select',
    value: '0',
    options: [
      {label: 'world1', text: '<p>Select: <el id="1"></el> subselect: <el id="3"></el></p>'},
      {label: 'world2'}
    ]
  }, {
    id: '3',
    type: 'checkbox',
    title: "external checkbox",
    value: [0],
    delimiter: ', ',
    options: [
      {label: 'world1'},
      {label: 'world2', text: 'Select2: <el id="1"></el> "<p>еуіе</p><p><el id=\"1\" contenteditable=\"false\" type=\"text\" style=\"cursor: pointer;\">input</el></p>"'}
    ]
  },
  {
    id: '4',
    type: 'radio',
    title: "external radio",
    value: null,
    options: [
      {label: 'radio 1'},
      {label: 'radio 2', text: 'Select2: <el id="1"></el> testRadio'}
    ]
  },
  {
    id: '5',
    title: 'input without references',
    type: 'text',
    value: 'inline input'
  }
  ]
}));
const json = computed(() => {
  return JSON.stringify(schema.value, null, 2);
});

function addSection() {
  schema.value.addSection(new Section(schema.value));
}

</script>

<template>
  <main>
    elements {{ schema.elements }}
    <div class="card">
      <div class="card-header">Sections
        <button @click="addSection">+</button>
      </div>
      <div class="card-body">
        <!-- <SectionComponent v-for="section in schema.sections" :section="section" :schema="schema"/> -->
        <SectionComponentAdmin v-for="section in schema.sections" :section="section" :schema="schema" :index="index"/>
      </div>
    </div>
    <textarea :value="json" @change="setJson" style="width: 100%" rows="100"/>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}
</style>
