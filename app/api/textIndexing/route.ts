import { textIndexing } from "@/rag/textIndexing";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { validateTextIndexing } from "@/validators/indexingApi.validator";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req : NextRequest){

    const formData = await req.formData();
    const copiedText = formData.get("copiedText") as string;
    const userSessionId = req?.headers.get("x-user-session");
    
    if(!userSessionId){
        throw new ApiError("x-user-session header is required",400);
    }

    const validations  = validateTextIndexing({text : copiedText, userSessionId});

    if(!validations.success){
        throw new ApiError(`Invalid Text indexing data ${validations.error}`,400);
    }


     const indexingFileId = await textIndexing(copiedText, userSessionId);
    if (!indexingFileId) {
    throw new ApiError("Indexing Failed ❌", 500);
     }

   return NextResponse.json(
    new ApiResponse(
      200,
      {
        fileId: indexingFileId,
      },
      "Text Indexing Successfully ✅"
    ),
    { status: 200 }
  );

}