import { computed, ComputedRef, ref, shallowReactive } from "vue";
import { Schema } from "./schema";
import { Textable } from "./textable";
import { Value } from "./value";

export class Element extends Textable {
  public id: string;
  private _type = ref<'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'radio'>();
  private _title = ref('');
  private _value = ref();
  public options = shallowReactive(new Array<Value>());
  public _delimiter = ref('');
  public _template = ref('');

  private _references: ComputedRef<Array<string>>;
  get references(): Array<string> {
    this._references ??= computed(() => [...new Set(this.options.map(option => option.references).flat())]);

    return this._references.value;
  }

  get delimiter() {
    return this._delimiter.value;
  }

  set delimiter(value: string) {
    this._delimiter.value = value;
  }

  get template() {
    return this._template.value;
  }

  set template(value: string) {
    this._template.value = value;
  }

  get value() {
    return this._value.value;
  }

  set value(value) {
    this._value.value = value;
  }

  get type() {
    return this._type.value;
  }
  
  set type(value) {
    this._type.value = value;
  }
  
  set title(value: string) {
    this._title.value = value;
  }

  get title() {
    return this._title.value;
  }

  get text() {
    if (['select', 'radio'].includes(this.type)) {
      const option = this.options[+(this.value ?? 0)];
      return option?.text || option?.label || '';
    }

    if (this.type === 'checkbox') {
      return this.options
        .filter((_, index) => (this.value as Set<any>).has(index))
        .map(option => option.text || option?.label || '')
        .join(this.delimiter);
    }

    return `${this.value ?? ''}`;
  }

  set text(value: string) {
    // unable to set text on element
  }

  private _isInline: ComputedRef<boolean>;
  get isInline(): boolean {
    this._isInline ??= computed(() => {
      if (['checkbox', 'radio'].includes(this.type)) {
        return false;
      }
      if (['select'].includes(this.type)) {
        return !this.options.some(option => !!option.text);
      }
    });

    return this._isInline.value;
  }

  static fromJSON(schema: Schema, data: object): Element {
    const element = new Element(schema);
    element.id = data['id'];
    element._type.value = data['type'];
    element._title.value = data['title'];
    element._value.value = element.type === 'checkbox' ? new Set(data['value'] ?? []) : data['value'];
    if (['select', 'radio', 'checkbox'].includes(element.type) && Array.isArray(data['options'])) {
      data['options'].forEach((option: object) => {
        element.options.push(Value.fromJSON(schema, option));
      });
    }

    if (element.type === 'checkbox') {
      element._delimiter.value = data['delimiter'] || '';
      element._template.value = data['template'] || '';
    }

    return element;
  }

  toJSON(): object {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      value: this.type === 'checkbox' ? Array.from((this.value as Set<any>).values()) : this.value,
      ...(['select', 'radio', 'checkbox'].includes(this.type) && { options: this.options }),
      ...(this.type === 'checkbox' && {
        delimiter: this.delimiter,
        template: this.template,
      }),
    }
  }
}