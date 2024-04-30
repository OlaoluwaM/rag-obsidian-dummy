import fs from "fs/promises";
import { ObsidianLoader } from "langchain/document_loaders/fs/obsidian";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

const commandLineArgs = process.argv.slice(2);
const dirPath = commandLineArgs[0];

if (!dirPath) {
  throw new Error("No directory path provided");
}

const allFiles = await fs.readdir(dirPath, { withFileTypes: true });

const allFileNames = allFiles
  .filter((file) => file.isFile())
  .map((file) => file.name);

const bar = allFiles.map((file) => `${file.path}/${file.name}`);

// console.log(bar.join("\n"));

// @ts-ignore
function readChunks(reader) {
  return {
    async *[Symbol.asyncIterator]() {
      let readResult = await reader.read();
      while (!readResult.done) {
        yield readResult.value;
        readResult = await reader.read();
      }
    },
  };
}
fetch("http://localhost:11434/api/chat", {
  method: "POST",
  body: JSON.stringify({
    model: "llama3",
    stream: false,
    messages: [
      {
        role: "user",
        content: `Hello, here are a list of file paths: ${allFileNames.join(
          ", "
        )}. Which ones do you think are the most relevant to the question "What is a function in programming"? Return the top 3. Give me the names as they appear in the list. After provide your reasoning for picking these`,
      },
    ],
  }),
}).then(async (res) => {
  const resp = await res.json();
  console.log(resp);
});
const loader = new ObsidianLoader(dirPath);
// const docs = await loader.load();

// const splitter = new RecursiveCharacterTextSplitter({
//   chunkOverlap: 100,
//   chunkSize: 500,
// });

// const splitDocuments = await splitter.splitDocuments(docs);

// const vectorstore = await HNSWLib.fromDocuments(
//   splitDocuments,
//   new HuggingFaceTransformersEmbeddings()
// );

// const retrievedDocs = await vectorstore.similaritySearch("Anything on CPUs");

// console.log(retrievedDocs[0]);

/*
  Document {
    pageContent: 'Task decomposition can be done (1) by LLM with simple prompting like "Steps for XYZ.\\\\n1.", "What are the subgoals for achieving XYZ?", (2) by using task-specific instructions; e.g. "Write a story outline." for writing a novel, or (3) with human inputs.',
    metadata: {
      source: 'https://lilianweng.github.io/posts/2023-06-23-agent/',
      loc: { lines: [Object] }
    }
  }
*/
