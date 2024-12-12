<script lang="ts">

</script>
<script setup lang="ts">
import {QuillEditor} from '@vueup/vue-quill'
import {computed, onMounted, ref} from "vue";
import {Element, Textable} from "../schema";
import Quill from "quill"
import ElementEditorComponent from "./ElementEditorComponent.vue";
import ModalComponent from "./ModalComponent.vue";

const {textable} = defineProps({
  textable: Textable
})

const editableElement = ref<Element | null>(null);

class ElInline extends Quill.imports['blots/embed'] {
  declare contentNode: HTMLElement;
  declare domNode: HTMLElement;
  static blotName = 'code';
  static tagName = 'EL';

  constructor(node) {
    super(node);

    this.domNode.childNodes.forEach((node) => this.domNode.removeChild(node));
    this.domNode.setAttribute('contenteditable', 'false');
    this.domNode.style.cursor = 'pointer';
    this.domNode.addEventListener('click', () => {
      console.log('click', this.domNode);
      editableElement.value = Element.fromJSON(textable.schema, textable.schema.getElement(this.domNode.getAttribute('id')).toJSON());
    });
    try {
      const element = textable.schema.getElement(this.domNode.getAttribute('id'));
      this.domNode.innerHTML = element.type ?? 'New element';
      this.domNode.setAttribute('type', element.type);
    } catch (e) {
      console.error(e);
    }
  }

  static create(value) {
    const node = super.create(value);
    node.setAttribute('id', value);
    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute('id');
  }
}


class ElModule extends Quill.imports['core/module'] {
  static register() {
    Quill.register(ElInline, true);
  }
}

const text = computed({
  get: () => textable.text,
  set: (value: string) => textable.text = value.replaceAll(/<el id="(\d+)"[^>]*>[^<]*<\/el>/g, '<el id="$1"></el>')
})

const editor = ref(null);
const quillInstance = ref(null);
onMounted(() => {
  if (editor.value) {
    quillInstance.value = editor.value.getQuill();
  }
});

let selection;
function requestAddElement() {
   selection = [this,this.quill.getSelection()];
   editableElement.value = new Element(textable.schema);
}

function addElementToEditor() {
  const isNew = !editableElement.value.id;

  textable.schema.addElement(editableElement.value);
  if(isNew) {
    selection[0].insertEmbed(
      selection[1],
        "code",
        editableElement.value.id,
        "api",
    );
  }
  editableElement.value = null;
}

</script>

<template>
  <div class="editor">
    <QuillEditor ref="editor" contentType="html"
                 v-model:content="text"
                 :modules="{name:'el', module:ElModule}"
                 :toolbar="{container: [['bold', 'italic', 'underline', 'strike'], ['link', 'image'], ['clean'],['code']], handlers: {code: requestAddElement}}"
    />
  </div>
  <ModalComponent v-if="editableElement" @hide="editableElement = null">
    <template #title>{{ editableElement?.label ?? 'New element' }}</template>
    <template #footer>{{ editableElement?.label ?? 'New element' }}</template>
    <!-- <ElementEditorComponent :element="editableElement"/> -->
    editableElement {{ editableElement ?? 'test' }}
    <div>
      <label for="type">Select Type:</label>
      <select id="type" v-model="editableElement.type">
        <option value="text">text</option>
        <option value="select">select</option>
        <option value="radio">radio</option>
      </select>
      <button type="button" @click="addElementToEditor()">{{ editableElement.id ? 'Edit element' : 'Add element' }}</button>
    </div>
  </ModalComponent>
</template>

<style lang="scss" scoped>
.editor::v-deep(el) {
  width: 100px;
  display: inline-block;
  border-bottom: 1px solid black;
  line-height: 1;

  &:before {
    content: ' ';
  }

  &:hover {
    background-color: #f0f0f0;
  }
}
</style>