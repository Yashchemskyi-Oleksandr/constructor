import { computed, ComputedRef, ref } from "vue";
import { Schema } from "./schema";

export class Textable {
  private _text = ref('');
  private _references: ComputedRef<Array<string>>;
  get references(): Array<string> {
      this._references ??= computed(() => [
          ...new Set(Array.from(this.text.matchAll(/<el id="(\d+)"[^>]*>[^<]*<\/el>/g))
              .map(([, id]) => [id, this.schema.getElement(id).references])
              .flat(2))
      ]);
      return this._references.value;
  }

  get text() {
    return this._text.value;
  }

  set text(value: string) {
    this._text.value = value;
  }

  constructor(public readonly schema: Schema) { }

  getText(): string {
    return this.text.replace(/<el id="(\d+)"[^>]*>[^<]*<\/el>/g, (match, id) => this.schema.getElement(id).getText());
  }

  toJSON(): object {
    return {
      text: this.text
    }
  }
}