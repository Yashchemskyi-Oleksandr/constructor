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
      text: '<p>Hello <el id="1"></el> world <el id="2"></el></p> radioVal: <el id="4"></el>',
      elements: []
    }
  ],
  elements: [{
    id: '1',
    type: 'text',
    value: 'world'
  }, {
    id: '2',
    title: "external select",
    type: 'select',
    value: '0',
    options: [
        {label: 'world1', text: 'Select: <el id="1"></el> subselect: <el id="3"></el>'},
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
      {label: 'world122'},
      {label: 'world222', text: 'Select2: <el id="1"></el> testRadio'}
    ]
  },
  {
    id: '5',
    type: 'text',
    value: 'world'
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
