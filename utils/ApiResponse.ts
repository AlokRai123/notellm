class ApiResponse {
    public success : boolean;

    constructor(
        public statusCode : number,
        public message : string,
        public data : any
    ){
        this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    }
}

export { ApiResponse };