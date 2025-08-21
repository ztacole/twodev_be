export interface GroupIA02Response {
    id: number;
    assessment_id: number;
    name: string;
    scenario: string;
    duration: number;
    units: ucIAResponse[];
    tools: IA02ToolsResponse[];
}

interface ucIAResponse {
    id: number;
    unit_code: string;
    title: string;
}

interface IA02ToolsResponse {
    id: number;
    name: string;
}