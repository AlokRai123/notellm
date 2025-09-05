import {QdrantClient} from '@qdrant/js-client-rest';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ApiError } from '@/utils/ApiError';
import crypto from "crypto";
import { QdrantVectorStore } from '@langchain/qdrant';

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const indexing = async (pdf : File,userSessionId : string) => {

    const loader = new PDFLoader(pdf);

    //page by page load the pdf
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    if(!splitDocs || splitDocs.length === 0){
         // return res.status(400).json({ error: 'No content could be extracted from the file' });
         throw new ApiError("No content could be  extracted from the file",400);
    }

    const fileID = crypto.randomBytes(5).toString("hex");

    const newDocs = await splitDocs.map((chunk) => (
        {
        ...chunk,
        metadata :{
            ...chunk.metadata,
            fileID,
        },
    }));

    // ready the openAI embedding model
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
     });

     await QdrantVectorStore.fromDocuments(newDocs,embeddings,{
        url : process.env.QDRANT_URL,
        apiKey : process.env.QDRANT_API_KEY,
        collectionName : `notellm-${userSessionId}`,
     });


     await client.createPayloadIndex(`notellm-${userSessionId}`,{
        field_name : "fileID",
        field_schema : {type : "keyword"}
     });

    return fileID;

}
