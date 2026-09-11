// Se define la interface para el objeto de los empleos
export interface Job {
    title: string,
    company: string,
    link: string
    tags: string[]
    salary: string
}

// Se define la respuesta nativa de la API de remoteOk
export interface RemoteOkResponse {
    id: string;
    position: string;
    company: string;
    url: string;
    tags?: string[];
    salary_min?: number;
    salary_max?: number;
}