<script lang="ts">
import {computed, createTextVNode, createVNode, defineComponent, Fragment} from "vue";
import {Schema} from "../schema";
import ElementComponent from "./ElementComponent.vue";

function textToNode(text: string) {
  const fragment = document.createElement('template');
  fragment.innerHTML = text;
  return fragment.content;
}

function nodeToVNode(node: Node, schema: Schema) {
  return Array.from(node.childNodes)
      .map((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return createTextVNode((node as Text).data);
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (el.tagName === 'EL') {
            const element = schema.getElement(el.getAttribute('id'));
            return element.isInline
                ? createVNode(ElementComponent, {element, inline:true})
                : createVNode(Fragment, null, nodeToVNode(textToNode(element.text), schema));
          }
          return createVNode(el.nodeName, Array.from(el.attributes).reduce((acc, atttr) => Object.assign(acc, {
            [atttr.name]: atttr.value
          }), {}), nodeToVNode(node, schema))
        }
      }).filter(Boolean);
}

export default defineComponent({
  props: {
    value: {
      required: true,
      type: String
    },
    schema: {
      required: true,
      type: Schema
    }
  },

  setup(props: { value: string, schema: Schema }) {
    const fragment = computed(() => textToNode(props.value))
    return () => createVNode(Fragment, null, nodeToVNode(fragment.value, props.schema))
  }
})
</script>