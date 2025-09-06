interface APIResponse{
    sourceCode: number;
    success : boolean;
    message : string;
    data : {
        [key : string] : any;
    }
}

interface ChatUploadedType{
    userQuery : string;
}

export type {
    APIResponse,
    ChatUploadedType
}