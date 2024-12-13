import {reactive, shallowReactive} from "vue";
import {Element} from "./element";
import {Section} from "./section";

export class Schema {
  private latestElementId: number = 0;
  public sections = shallowReactive(new Array<Section>());
  public elements = shallowReactive(new Map<string, Element>);

  addSection(section: Section) {
    this.sections.push(section);
    return this;
  }

  copySection(index: number) {
    const originalSection = this.sections[index];
  
    if (!originalSection) {
      throw new Error(`Section at index ${index} does not exist`);
    }
  
    const sectionData = originalSection.toJSON();
    const newSection = Section.fromJSON(this, sectionData);
    this.addSection(newSection);
  
    return newSection;
  }

  removeSectionByIndex(index: number): this {
    if (index < 0 || index >= this.sections.length) {
      throw new Error(`Index ${index} is out of bounds`);
    }
    this.sections.splice(index, 1);
    return this;
  }

  getElement(id: string): Element {
    if (!this.elements.has(id)) {
      throw new Error(`Element with id ${id} not found`);
    }

    return this.elements.get(id);
  }

  addElement(element: Element) {
    console.log('element', element.value);
    
    if (!element.id) {
      element.id = this.getNewId();
    }
    this.elements.set(element.id, element);
  }

  static fromJSON(data: object) {
    const schema = new Schema();
    schema.latestElementId = data['latestElementId'] ?? 0;

    if (Array.isArray(data['elements'])) {
      data['elements'].forEach((elementData) => {
        schema.addElement(Element.fromJSON(schema, elementData));
      });
    }

    if (Array.isArray(data['sections'])) {
      data['sections'].forEach((sectionData: object) => {
        schema.addSection(Section.fromJSON(schema, sectionData));
      });
    }

    return schema;
  }

  toJSON() {
    return {
      latestElementId: this.latestElementId,
      sections: this.sections,
      elements: Array.from(this.elements.values())
    }
  }

  getNewId() {
    return `${++this.latestElementId}`;
  }
}