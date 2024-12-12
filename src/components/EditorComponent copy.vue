<script lang="ts">

</script>
<script setup lang="ts">
import {QuillEditor} from '@vueup/vue-quill'
import {computed, ref} from "vue";
import {Element, Textable} from "../schema";
import Quill from "quill"
import ElementEditorComponent from "./ElementEditorComponent.vue";
import ModalComponent from "./ModalComponent.vue";

const {textable} = defineProps({
  textable: Textable
})

// const editableElement = ref(null)

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
    // this.domNode.addEventListener('click', () => {
    //   console.log('click', this.domNode);
    //   editableElement.value = textable.schema.getElement(this.domNode.getAttribute('id'));
    // });
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


function addElement(e, b) {
  const selection = this.quill.getSelection();
  const element = new Element(textable.schema);
  element.type = 'text';
  textable.schema.addElement(element);
  this.quill.insertEmbed(
      selection.index,
      "code",
      element.id,
      "api",
  );
  // editableElement.value = new Element(textable.schema);
}

const editor = ref(null)
</script>

<template>
  <div class="editor">
    <QuillEditor ref="editor" contentType="html"
                 v-model:content="text"
                 :modules="{name:'el', module:ElModule}"
                 :toolbar="{container: [['bold', 'italic', 'underline', 'strike'], ['link', 'image'], ['clean'],['code']], handlers: {code: addElement}}"
    />
  </div>
  <!-- <ModalComponent v-if="editableElement" @hide="editableElement = null">
    <template #title>{{ editableElement.label ?? 'New element' }}</template>
    <template #footer>{{ editableElement.label ?? 'New element' }}</template>
    <ElementEditorComponent :element="editableElement"/>
  </ModalComponent> -->
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

<!-- /// new one -->
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
      editableElement.value = textable.schema.getElement(this.domNode.getAttribute('id'));
      showModal.value = true;
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
const elementType = ref(null);
const editorSelectionIndex = ref<number | null>(null);
const showModal = ref<boolean>(false);

const quillInstance = ref(null);
onMounted(() => {
  if (editor.value) {
    quillInstance.value = editor.value.getQuill();
  }
});

function addElement() {
  const element = new Element(textable.schema);
  element.type = elementType.value;
  element.value = '';
  textable.schema.addElement(element);
  quillInstance.value.insertEmbed(
      editorSelectionIndex.value,
      "code",
      element.id,
      "api",
  );
  console.log('element', element);
}

function requestAddElement(e, b) {
  const selection = this.quill.getSelection();
  editorSelectionIndex.value = selection.index;
  showModal.value = true;
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
  <ModalComponent v-if="showModal" @hide="showModal = false">
    <template #title>{{ editableElement?.label ?? 'New element' }}</template>
    <template #footer>{{ editableElement?.label ?? 'New element' }}</template>
    <!-- <ElementEditorComponent :element="editableElement"/> -->
    editableElement {{ editableElement }}
    <div>
      <label for="type">Select Type:</label>
      <select id="type" v-model="elementType" @change="addElement">
        <option value="text">text</option>
        <option value="select">select</option>
        <option value="radio">radio</option>
      </select>
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