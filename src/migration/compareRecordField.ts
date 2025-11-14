export function compareRecordField(value_one: any, value_two: any): boolean {
    // handle Date comparison
    if (value_one instanceof Date && value_two instanceof Date) {
        return value_one.getTime() === value_two.getTime();
    }
    return value_one === value_two;
}