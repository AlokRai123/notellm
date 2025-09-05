import { ApiError } from "@/utils/ApiError";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import crypto from "crypto";
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";
import { OpenAIEmbeddings } from "@langchain/openai";


const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

export const webIndexing = async (url : string,userSessionId : string) => {
    
    const compiledConvert = compile({wordwrap : 130});

     const loader = new RecursiveUrlLoader(url, {
    extractor: compiledConvert,
    maxDepth: 1,
    excludeDirs: ["/docs/api/"],
  });

  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
  });

  console.log({textSplitter});

  const splitDocs = await textSplitter.splitDocuments(docs);

  if(!splitDocs || splitDocs.length === 0){
      throw new ApiError("No content could be  extracted from the file",400);
  };

  const fileID = crypto.randomBytes(5).toString("hex");

  const newDocs = await splitDocs.map((chunk) => ({
      ...chunk,
      metadata :{
          ...chunk.metadata,
          fileID,
      },
  }));

//   const embeddings = new GoogleGenerativeAIEmbeddings({
//     apiKey: process.env.GEMINI_API_KEY,
//     model: "models/embedding-001", // Correct Gemini embeddings model
//   });

const embeddings = new OpenAIEmbeddings({
    model : "text-embedding-3-large"
  });

   await QdrantVectorStore.fromDocuments(newDocs,embeddings,{
    url : process.env.QDRANT_URL,
    apiKey : process.env.QDRANT_API_KEY,
    collectionName : `notellm-${userSessionId}`,
  });

  await client.createPayloadIndex(`notellm-${userSessionId}`,{
    field_name: "fileID",
    field_schema: { type: "keyword" },
  });

  return fileID;

}