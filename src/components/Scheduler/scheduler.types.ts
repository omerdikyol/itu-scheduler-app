
export type Course = {
    crn: string;
    code: string;
    name: string;
    instructor: string;
    capacity: number;
    enrolled: number;
    day: string;
    time: string;
    // Derived fields
    dayIndex: number;
    startMin: number;
    endMin: number;
    duration: number;
    isMandatory: boolean;
};

export interface LayoutCourse extends Course {
    style?: React.CSSProperties;
}
