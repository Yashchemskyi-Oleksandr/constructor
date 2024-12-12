import { ref } from "vue";
import {Schema} from "./schema";
import {Textable} from "./textable";

export class Value extends Textable {
  private readonly _label = ref('');

  set text(value: string) {
    super.text = value;
  }
  get text(): string {
    return super.text || this.label;
  }

  get label() {
    return this._label.value;
  }

  set label(value: string) {
      this._label.value = value;
  }

  static fromJSON(schema: Schema, data: object) {
    const value = new Value(schema);
    value.text = data['text'] ?? '';
    value.label = data['label'];
    return value;
  }

  toJSON(): object {
    return {
      label: this.label,
      ...super.toJSON(),
    }
  }
}