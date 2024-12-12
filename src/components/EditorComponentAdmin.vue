<script lang="ts">

</script>
<script setup lang="ts">
import {QuillEditor} from '@vueup/vue-quill'
import {computed, ref} from "vue";
import {Element, Textable, Value} from "../schema";
import Quill from "quill"

const {currElem} = defineProps({
  currElem: Element,
  modelValue: String,
})

const emit = defineEmits(['update:modelValue']);

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
    try {
      this.domNode.innerHTML = 'input';
      this.domNode.setAttribute('type', 'text');
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
  get: () => currElem?.label,
  // set: (value: string) => currElem?.text = value.replaceAll(/<el id="(\d+)"[^>]*>[^<]*<\/el>/g, '<el id="$1"></el>')
})

function addElement(e, b) {
  const selection = this.quill.getSelection();
  const element = new Element(currElem.schema);
  element.type = 'text';
  currElem.schema.addElement(element);
  this.quill.insertEmbed(
      selection.index,
      "code",
      element.id,
      "api",
  );
}
const updateContent = (content: string) => {
  emit('update:modelValue', content);
};
const editor = ref(null)
</script>

<template>
  <div class="editor">
    <QuillEditor ref="editor" contentType="html"
                 v-model:content="text"
                 @update:content="updateContent"
                 :modules="{name:'el', module:ElModule}"
                 :toolbar="{container: [['bold', 'italic', 'underline', 'strike'], ['link', 'image'], ['clean'],['code']], handlers: {code: addElement}}"
    />
  </div>
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