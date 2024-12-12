import { computed, ComputedRef, ref } from "vue";
import { Schema } from "./schema";
import { Textable } from "./textable";

export class Section extends Textable {
  private _isRequired = ref<boolean>(false);
  private _withHint = ref<boolean>(false);
  private _hint = ref<string>('');

  get isRequired() {
    return this._isRequired.value;
  }

  set isRequired(value: boolean) {
    this._isRequired.value = value;
  }

  get withHint() {
    return this._withHint.value;
  }

  set withHint(value: boolean) {
    this._withHint.value = value;
  }

  get hint(): string {
    return this._hint.value;
  }

  set hint(value: string) {
    this._hint.value = value;
  }

  private _external: ComputedRef<Array<string>>;
  get external(): Array<string> {
      this._external ??= computed(() => this.references
          .filter(ref => !this.schema.getElement(ref).isInline));
      return this._external.value;
  }


  static fromJSON(schema: Schema, data: object) {
    const section = new Section(schema);
    section.text = data['text'] ?? '';
    section.isRequired = data['isRequired'] ?? false;
    section.withHint = data['withHint'] ?? false;
    section.hint = data['hint'] ?? '';
    return section;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      isRequired: this.isRequired,
      withHint: this.withHint,
      hint: this.hint,
    }
  }
}