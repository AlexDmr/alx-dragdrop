export interface MyDocument extends Document {
    elementsFromPoint(x: number, y: number): Array<Element>;
}
export declare let myDoc: MyDocument;
