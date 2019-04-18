type Options = {
    types?: boolean,
    time?: boolean,
    memory?: boolean,
    errors?: boolean
}

declare module "date-range-array" {
    function f(start: string, end: string): string[]
    export = f
}

declare module "download-file-sync" {
    function f(path: string): string
    export = f
}
